from typing import Annotated
from livekit.agents import llm, JobContext
from livekit.agents.pipeline import VoicePipelineAgent
import asyncio
from livekit import api

class AssistantFnc(llm.FunctionContext):
    ctx: JobContext
    agent: VoicePipelineAgent
    chat_ctx: llm.ChatContent
    assistant_info: None

    def __init__(self):
        super().__init__()
    
    def register(self, agent, chat_ctx, ctx, assistant_info):
        self.agent = agent
        self.chat_ctx = chat_ctx
        self.ctx = ctx
        self.assistant_info = assistant_info

    @llm.ai_callable()
    async def hang_up_call(
        self,
        last_speak: Annotated[
            str, llm.TypeInfo(description="Optional final sentence to say before hanging up the call.")
        ]
    ):
        """Ends the call. Optionally speaks a final sentence before hanging up."""
        print(f"hang_up_call call function called.")
        duration = 0
        if last_speak:
            # Say the final words (await if say is async)
            await self.agent.say(last_speak)

            # Log to chat history
            self.chat_ctx.append(
                role="assistant",
                text=last_speak
            )

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

        #fetching live is pending
        return "Only Sunday is avaible"

    

    @llm.ai_callable()
    async def book_appointment(
        self,
        start: Annotated[str, llm.TypeInfo(description="The start date and time of the booking in ISO 8601 format.")],
        location: Annotated[str, llm.TypeInfo(description="The chosen location option for the appointment.")],
        email: Annotated[str, llm.TypeInfo(description="The email address of the client.")],
        name: Annotated[str, llm.TypeInfo(description="The full name of the client.")],
        reason: Annotated[str, llm.TypeInfo(description="The reason for the appointment or meeting.")],
        language: Annotated[str, llm.TypeInfo(description="The language preference for the appointment.")]
    ):
        """Creates a booking entry with client and appointment details, including time, location, email, and reason for the appointment."""

        # Simulate booking process (or plug in your logic here)
        print("Booking Details:")
        print(f"Name: {name}, Email: {email}, Reason: {reason}")

        return {
            "status": "success",
            "message": f"Appointment booked for {name} on {start}."
        }
