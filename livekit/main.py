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
from livekit.plugins import deepgram, openai, silero
from livekit.plugins.deepgram import tts
from services.assistant_function_service import AssistantFnc

logger = logging.getLogger("voice-assistant")
load_dotenv()



def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    #initialize llm
    initial_ctx = llm.ChatContext().append(
        role="system",
        text="You are helpfull assistant"
    )

    fnc_ctx = AssistantFnc()

    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # wait for the first participant to connect
    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    dg_model = "nova-3-general"
    
    #if call phone then we will use this model
    if participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
        dg_model = "nova-2-phonecall"



    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(model=dg_model),
        llm=openai.LLM(model='gpt-4o'),
        # tts=openai.TTS(),
        tts=tts.TTS(model="aura-asteria-en"),
        chat_ctx=initial_ctx,
        fnc_ctx=fnc_ctx
    )

    fnc_ctx.register(agent=agent,chat_ctx=initial_ctx,ctx=ctx,assistant_info={})
    agent.start(ctx.room, participant)

    usage_collector = metrics.UsageCollector()

    @agent.on("user_started_speaking")
    def user_started_speaking():
        print("User speaking start.")

    @agent.on("user_stopped_speaking")
    def user_started_speaking():
        print("User speaking stopped.")



    async def log_usage():
        print("User Disconnected")
        summary = usage_collector.get_summary()
        logger.info(f"Usage: ${summary}")
        #when call end then we will call hangcall here

        
    await agent.say("Hello How can i assist you today.", allow_interruptions=True)
    ctx.add_shutdown_callback(log_usage)

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            shutdown_process_timeout=2
        ),
    )