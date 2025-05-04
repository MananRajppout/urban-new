import logging
from dotenv import load_dotenv
from livekit import rtc,api
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
    metrics
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, openai, silero, smallest, elevenlabs
from livekit.plugins.deepgram import tts
from services.assistant_function_service import AssistantFnc
from app_types.assistant_type import Assistant
from app_types.callconfig_type import CallContext
from services.api_service import fetch_assistant_id, call_webhook_pickup, call_webhook_hangup
from utils.generate_prompt import generate_prompt

import json
logger = logging.getLogger("voice-assistant")
load_dotenv()



def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    #initialize llm
    
    
    fnc_ctx = AssistantFnc()

    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)


    # wait for the first participant to connect
    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    #get call metadata
    call_ctx: CallContext = json.loads(participant.metadata)
    
    



    #fetch assistant info
    assistant_info:Assistant | None = fetch_assistant_id(call_ctx.get('agentId'))
    if assistant_info is None:
        logger.error(f"assistant info not found for {call_ctx.get('agentId')}")
        await ctx.api.room.delete_room(
            api.DeleteRoomRequest(
                room=ctx.room.name,
            )
        )
        return
    
    #call webhook pickup
    isWebCall = call_ctx.get('callType') == 'web'
    if isWebCall:
        logger.info("Web call")
        call_webhook_pickup(call_ctx,assistant_info)

    


    initial_ctx = llm.ChatContext().append(
        role="system",
        text=generate_prompt(assistant_info)
    )

    print(assistant_info.get("voice_engine_name"),"voice_engine_name")

    tts = None
    if assistant_info.get("voice_engine_name") == "smallest":
        tts = smallest.TTS(voice=assistant_info.get("voice_id"))
    elif assistant_info.get("voice_engine_name") == "elevenlabs":
        tts = elevenlabs.TTS(voice=assistant_info.get("voice_id"))
    elif assistant_info.get("voice_engine_name") == "sarvam":
         tts = smallest.TTS(voice=assistant_info.get("voice_id"))
    else:
        tts = smallest.TTS(voice=assistant_info.get("voice_id"))

    dg_model = "nova-3"
    

    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(language="hi",model=dg_model),
        llm=openai.LLM(model='gpt-4o'),
        # tts=openai.TTS(),
        tts=tts,
        chat_ctx=initial_ctx,
        fnc_ctx=fnc_ctx
    )
    

    #function calling
    fnc_ctx.register(agent=agent,chat_ctx=initial_ctx,ctx=ctx,assistant_info={})
    agent.start(ctx.room, participant)
    usage_collector = metrics.UsageCollector()


    #event handling
    @agent.on("user_started_speaking")
    def user_started_speaking():
        print("User speaking start.")

    @agent.on("user_stopped_speaking")
    def user_started_speaking():
        print("User speaking stopped.")
    
    @agent.on("agent_started_speaking")
    def agent_started_speaking():
        print("Agent speaking started.")
    
    @agent.on("agent_stopped_speaking")
    def agent_stopped_speaking():
        print("Agent speaking stopped.")


    #on call end
    async def log_usage():
        print("User Disconnected")
        summary = usage_collector.get_summary()
        logger.info(f"Usage: ${summary}")
        #call webhook hangup
        call_webhook_hangup(call_ctx,assistant_info,initial_ctx)

    
    #shutdown callback
    await agent.say(assistant_info.get('welcome_message_text'), allow_interruptions=True)
    ctx.add_shutdown_callback(log_usage)

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            shutdown_process_timeout=2
        ),
    )