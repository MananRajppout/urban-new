from typing import Annotated
from livekit.agents import llm, JobContext
from livekit.agents.pipeline import VoicePipelineAgent
import asyncio
from livekit import api
from services.calcom_service import fetch_avaible_slots,book_appointment_request
from livekit.protocol import sip as proto_sip
import os
from app_types.callconfig_type import CallContext

class AssistantFnc(llm.FunctionContext):
    ctx: JobContext
    agent: VoicePipelineAgent
    chat_ctx: llm.ChatContent
    assistant_info: None
    room_name: str
    participant_identity: str
    livekit_api: api.LiveKitAPI
    call_ctx: CallContext

    def __init__(self,room_name,participant_identity):
        super().__init__()
        self.room_name = room_name
        self.participant_identity = participant_identity
        self.livekit_api = api.LiveKitAPI(api_key=os.getenv("LIVEKIT_API_KEY"),api_secret=os.getenv("LIVEKIT_API_SECRET"),url=os.getenv("LIVEKIT_URL"))

    def register(self, agent, chat_ctx, ctx, assistant_info, call_ctx):
        self.agent = agent
        self.chat_ctx = chat_ctx
        self.ctx = ctx
        self.assistant_info = assistant_info
        self.call_ctx = call_ctx

    @llm.ai_callable()
    async def hang_up_call(
        self,
        last_speak: Annotated[
            str, llm.TypeInfo(description="Optional final sentence to say before hanging up the call. Make sure you don't add any emojis—just simple text is needed here.")
        ]
    ):
        """Ends the call. Optionally speaks a final sentence before hanging up."""
        print(f"hang_up_call call function called.")
        duration = 0
        if last_speak:
            # Say the final words (await if say is async)
            await self.agent.say(last_speak)

            # Word-based duration estimate
            word_count = len(last_speak.split())
            duration = round(word_count / (120 / 60), 2) + 1
        
        # Wait for duration before hanging up
        await asyncio.sleep(duration)

        # Delete the room
        await self.ctx.api.room.delete_room(
            api.DeleteRoomRequest(
                room=self.ctx.room.name,
            )
        )
    
    @llm.ai_callable()
    async def get_available_slots(
        self,
        message: Annotated[
            str, llm.TypeInfo(description="A loading message to speak while fetching available slots.")
        ]
    ):
        """Fetches all available slots"""
        await self.agent.say(message)
        availableSlots = fetch_avaible_slots(self.assistant_info.get("calendar_tools")[0])
        return {
            "instruction": f"Firstly, complete the current conversation, then respond to the user with the available slots: {availableSlots}. Make sure that the text is readable, which means it should be like '24th and 25th april twenty fourth and twenty fifth April we have slots available which date do you prefer?'. This should not be in a JSON format, but rather in a natural, easy-to-understand way. For instance, if we are discussing available times, it should be clear like, 'user tells which date he want than you will tell on 25th we have 9am to 1pm.' rather than using just the numeric format. most importantly, if the user choose to book appointment, make sure to invoke the 'book_appointment' function.",
            "output": availableSlots
        }

    

    @llm.ai_callable()
    async def book_appointment(
        self,
        start: Annotated[str, llm.TypeInfo(description="The start date and time of the booking in ISO 8601 format.")],
        location: Annotated[str, llm.TypeInfo(description="The chosen location option for the appointment.")],
        email: Annotated[str, llm.TypeInfo(description="The email address of the client. make sure email shound be valid.")],
        name: Annotated[str, llm.TypeInfo(description="The full name of the client.")],
        reason: Annotated[str, llm.TypeInfo(description="The reason for the appointment or meeting.")],
        language: Annotated[str, llm.TypeInfo(description="The language preference for the appointment.")]
    ):
        """Creates a booking entry with client and appointment details, including time, location, email, and reason for the appointment."""

        # Simulate booking process (or plug in your logic here)
        print("Booking Details:")
        eventTypeId = self.assistant_info.get("calendar_tools")[0].get("AvailabilityCaleventTypeId")
        api_key = self.assistant_info.get("calendar_tools")[0].get("AvailabilityCalapiKey")
        timeZone = self.assistant_info.get("calendar_tools")[0].get("AvailabilityCaltimezone")

        res = book_appointment_request({
            "eventTypeId": int(eventTypeId),
            "start": start,
            "responses": {
                "location": {
                    "optionValue": location,
                    "value": location
                },
                "email": email,
                "name": name
            },
            "metadata": {
                "reason": reason
            },
            "timeZone": timeZone,
            "language": "en"
        },api_key)

        return res
    


    @llm.ai_callable()
    async def transfer_call(
        self,
        transfer_to_number: Annotated[str, llm.TypeInfo(description="The number to transfer the call to in E.164 format.")],
        error_message: Annotated[str, llm.TypeInfo(description="The error message to speak if the transfer fails.")],
    ):
        """Transfers the call to the specified number."""
        print(f"transfer_call function called.",transfer_to_number)
        
        if self.call_ctx.get("callType") == "web":
            await self.agent.say("I'm sorry, but I can't transfer the call to a web call. Please try again with a valid phone number.")
            return
        
        try:

            transfer_to = f"tel:{transfer_to_number}"
        

            transfer_request = proto_sip.TransferSIPParticipantRequest(
                participant_identity=self.participant_identity,
                room_name=self.room_name,
                transfer_to=transfer_to,
                play_dialtone=True
            )
        
            # Transfer caller
            await self.livekit_api.sip.transfer_sip_participant(transfer_request)
            print(f"Successfully transferred participant {self.participant_identity} to {transfer_to}")
        except Exception as e:
            print(f"Error transferring participant {self.participant_identity} to {transfer_to}: {e}")
            await self.agent.say(error_message)
        
        