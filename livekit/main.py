import logging
import asyncio
from dotenv import load_dotenv
from livekit import rtc, api
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
    metrics
)

from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import deepgram, openai, silero, elevenlabs, sarvam, smallest, assemblyai
# from services.assistant_function_service import AssistantFnc
from app_types.assistant_type import Assistant, Voice, VoiceSettings
from app_types.callconfig_type import CallContext
from services.api_service import (
    fetch_assistant_id,
    call_webhook_pickup,
    call_webhook_hangup,
)
from utils.generate_prompt import generate_prompt
from utils.get_welcome_message import get_welcome_message
import json
from livekit.plugins import groq
from livekit.plugins import noise_cancellation
import uuid
from livekit.plugins import rime
import os
from livekit.plugins import groq
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from services.agent_session import Assistant
from livekit.agents import  MetricsCollectedEvent, UserStateChangedEvent, AgentStateChangedEvent
from services.telemetry import setup_langfuse

logger = logging.getLogger("voice-assistant")
load_dotenv()



def prewarm(proc: JobProcess):
    """Optimized prewarm with faster VAD settings and caching"""
    # Optimized VAD settings for lower latency
    proc.userdata["vad"] = silero.VAD.load(
        # min_speech_duration=0.02,  # Reduced from 0.05 for faster detection
        # min_silence_duration=0.15,  # Reduced from 0.25 for quicker cutoff
        # prefix_padding_duration=0.0,
        # activation_threshold=0.08,  # Reduced from 0.1 for more sensitive detection
        # sample_rate=16000,
        # force_cpu=True
    )
    
    # Initialize assistant cache for faster lookups
    proc.userdata["assistant_cache"] = {}
    proc.userdata["timing"] = {}


async def create_tts_engine(assistant_info: Assistant):
    """Create TTS engine asynchronously"""
    tts_engine_name = assistant_info.get("voice_engine_name")
    voice_id = assistant_info.get("voice_id")

    if tts_engine_name == "deepgram":
        # Deepgram is typically fastest
        return deepgram.TTS(model="aura-2-asteria-en")
    elif tts_engine_name == "sarvam":
        return sarvam.TTS(
            speaker=voice_id, 
            target_language_code="en-IN", 
            model="bulbul:v1",
            pace=assistant_info.get("voice_speed")
        )
    elif tts_engine_name == "smallest":
        return smallest.TTS(voice_id=voice_id,speed=assistant_info.get("voice_speed"),model="lightning")
    elif tts_engine_name == "elevenlabs":
        DEFAULT_VOICE = Voice(
            id=voice_id,
            name="Bella",
            category="premade",
            settings=VoiceSettings(
                stability=0.71,
                speed=assistant_info.get("voice_speed"),
                similarity_boost=0.5,
                style=0.0,
                use_speaker_boost=True,
            ),
        )
        return elevenlabs.TTS(api_key=assistant_info.get("elevenlabs_api_key"),model="eleven_flash_v2_5",voice=DEFAULT_VOICE)
    elif tts_engine_name == "rime":
        def transform(x):
            return 2.0 - x if x > 1.0 else x
        speed = transform(assistant_info.get("voice_speed", 1.0))
        return rime.TTS(
            model="mistv2",
            speaker=voice_id,
            speed_alpha=speed,  # Adjust speed to match Rime's expected range
            reduce_latency=True,
            api_key=assistant_info.get("rime_api_key")
        )
    # elif tts_engine_name == "kokoro":
    #     return kokoro.TTS(voice_id="af_heart", speed=assistant_info.get("voice_speed"))
    elif tts_engine_name == "smallest-v2":
        return smallest.TTS(voice_id=voice_id,speed=assistant_info.get("voice_speed"),model="lightning-v2")
    elif tts_engine_name == "smallest-large":
        return smallest.TTS(voice_id=voice_id,speed=assistant_info.get("voice_speed"),model="lightning-large")
    else:
        # Default to fastest option
        return deepgram.TTS(model="aura-asteria-en")



async def create_llm_engine(assistant_info: Assistant):
    """Create LLM engine with optimized settings"""
    gpt_model = assistant_info.get("chatgpt_model", "gpt-4o-mini")
    
    # Optimized LLM settings for speed
    base_config = {
        "parallel_tool_calls": True,
        # "max_tokens": 100,  # Limit response length for faster generation
        "temperature": 0.7,  # Slightly lower for faster, more focused responses
    }
    
    if gpt_model == "gpt-4o-mini":
        return openai.LLM(model="gpt-4o-mini", **base_config)
    elif gpt_model == "gpt-4.1-nano-2025-04-14":
        return openai.LLM(model="gpt-4.1-nano-2025-04-14", **base_config)
    
    elif gpt_model == "meta-llama/llama-4-maverick-17b-128e-instruct":
        return groq.LLM(model="meta-llama/llama-4-maverick-17b-128e-instruct", **base_config)
    
    elif gpt_model == "meta-llama/llama-4-scout-17b-16e-instruct":
        return groq.LLM(model="meta-llama/llama-4-scout-17b-16e-instruct", **base_config)
    
    elif gpt_model == "llama-3.1-8b-instant":
        return groq.LLM(model="llama-3.1-8b-instant", **base_config)
    
    elif gpt_model == "llama3-8b-8192":
        return groq.LLM(model="llama3-8b-8192", **base_config)
    
    elif gpt_model == "cerebras/llama-4-maverick-17b-128e-instruct":
        return openai.LLM.with_cerebras(model="llama-4-maverick-17b-128e-instruct", **base_config)
    
    elif gpt_model == "cerebras/llama-4-scout-17b-16e-instruct":
        return openai.LLM.with_cerebras(model="llama-4-scout-17b-16e-instruct", **base_config)
    
    elif gpt_model == "cerebras/gpt-oss-120b":
        return openai.LLM.with_cerebras(model="gpt-oss-120b", **base_config)
    
    else:
        return groq.LLM(model="llama-3.1-8b-instant", **base_config)


async def create_stt_engine(assistant_info: Assistant):
    stt_engine = assistant_info.get("stt_engine", "nova-2-general")
    language = assistant_info.get("language", "en")
    print(f"stt_engine: {stt_engine}, language: {language}")

    if stt_engine == "nova-2-general":
        return deepgram.STT(language=language, model="nova-2-general",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "nova-2-phonecall":
        return deepgram.STT(language=language, model="nova-2-phonecall",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "nova-2-meeting":
        return deepgram.STT(language=language, model="nova-2-meeting",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "nova-2-finance":
        return deepgram.STT(language=language, model="nova-2-finance",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "nova-2-conversationalai":
        return deepgram.STT(language=language, model="nova-2-conversationalai",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "nova-2-medical":
        return deepgram.STT(language=language, model="nova-2-medical",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "nova-2-drivethru":
        return deepgram.STT(language=language, model="nova-2-drivethru",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "nova-2-automotive":
        return deepgram.STT(language=language, model="nova-2-automotive",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "nova-2-atc":
        return deepgram.STT(language=language, model="nova-2-atc",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "distil-whisper-large-v3-en":
        return groq.STT(language=language, model="distil-whisper-large-v3-en")
    elif stt_engine == "whisper-large-v3-turbo":
        return groq.STT(language=language, model="whisper-large-v3-turbo")
    elif stt_engine == "nova-3":
        return deepgram.STT(language=language, model="nova-3",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "nova-3-medical":
        return deepgram.STT(language=language, model="nova-3-medical",smart_format=False,punctuate=False,filler_words=False)
    elif stt_engine == "assemblyai":
        return assemblyai.STT(language=language)
    else:
        return deepgram.STT(language=language, model="nova-2-general",smart_format=False,punctuate=False,filler_words=False)

async def get_assistant_info(proc_userdata: dict, agent_id: str) -> Assistant | None:
    """Get assistant info with caching for faster retrieval"""    
    assistant_info = fetch_assistant_id(agent_id)
    if assistant_info:
        logger.info(f"Cached assistant info for {agent_id}")
    
    return assistant_info


async def entrypoint(ctx: JobContext):
    setup_langfuse()
    
    # Initialize connection
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for participant with timeout
    try:
        participant = await asyncio.wait_for(
            ctx.wait_for_participant(), 
            timeout=10.0
        )
    except asyncio.TimeoutError:
        logger.error("Participant connection timeout")
        await ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name))
        return

    # Initialize function context
    logger.info(f"starting voice assistant for participant {participant.identity}")

    # Parse call metadata
    call_ctx: CallContext = {}
    try:
        call_ctx = json.loads(
            participant.metadata if participant.metadata else participant.name
        )

        if(call_ctx["callId"] == "test-call-id"):
            call_ctx["callId"] = str(uuid.uuid4())
    except Exception as e:
        logger.error(f"error parsing metadata: {e}")
        await ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name))
        return
    
    logger.info(f"call_ctx: {call_ctx}")

    # Get assistant info (with caching)
    assistant_info = await get_assistant_info(ctx.proc.userdata, call_ctx.get("agentId"))
    print(assistant_info.get("voice_speed"))
    if assistant_info is None:
        logger.error(f"assistant info not found for {call_ctx.get('agentId')}")
        await ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name))
        return
    


    # Initialize TTS and LLM engines in parallel for faster setup
    
    tts_task = asyncio.create_task(create_tts_engine(assistant_info))
    llm_task = asyncio.create_task(create_llm_engine(assistant_info))
    stt_task = asyncio.create_task(create_stt_engine(assistant_info))
    
    tts, llm, stt = await asyncio.gather(tts_task, llm_task, stt_task)

    session = AgentSession(
        stt=stt,
        llm=llm,
        tts=tts,
        vad=silero.VAD.load(),
        preemptive_generation=True,
        turn_detection=MultilingualModel()
    )

    # Start agent
    await session.start(
        room=ctx.room,
        agent=Assistant(instructions=generate_prompt(assistant_info,call_ctx),ctx=ctx,assistant_info=assistant_info,room_name=ctx.room.name,participant_identity=participant.identity),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(), 
        )
    )

    session.say(
        get_welcome_message(assistant_info,call_ctx), 
        allow_interruptions=True
    )
    

    # Enhanced event handling with detailed timing
    @session.on("user_state_changed")
    def user_state_changed(event: UserStateChangedEvent):
        logger.info(f"User state changed: {event.new_state}")

    @session.on("agent_state_changed")
    def agent_state_changed(event: AgentStateChangedEvent):
        logger.info(f"Agent state changed: {event.new_state}")


    # Enhanced disconnect handling
    async def log_usage():
        logger.info(f"User disconnected")

        # Call webhook hangup
        chat_ctx = session.history.to_dict().get("items")
        call_webhook_hangup(call_ctx, assistant_info, chat_ctx)


    if(call_ctx.get("isGoogleSheet") == True):
        print("Google sheet call detected")
    else:
        asyncio.create_task(
            asyncio.to_thread(call_webhook_pickup, call_ctx, assistant_info)
        )
    
    transcription_delay = 0
    llm_latency = 0
    tts_latency = 0
    @session.on("metrics_collected")
    def metrics_collected(event: MetricsCollectedEvent):
        if(event.type != "metrics_collected"):
            return

        global end_of_utterance_delay, llm_latency, tts_latency
        try:
            if(event.metrics.type == "eou_metrics"):
                end_of_utterance_delay = event.metrics.end_of_utterance_delay

            if(event.metrics.type == "llm_metrics"):
                llm_latency = event.metrics.ttft

            if(event.metrics.type == "tts_metrics"):
                tts_latency = event.metrics.ttfb
                logger.info(f"Latency: Transcription Delay: {end_of_utterance_delay}s")
                logger.info(f"Latency: LLM {llm_latency}s")
                logger.info(f"Latency: TTS {tts_latency}s")
                logger.info(f"Latency: Total {end_of_utterance_delay + llm_latency + tts_latency}s")

        except Exception as e:
            pass
        

    # Register shutdown callback
    ctx.add_shutdown_callback(log_usage)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint, 
            prewarm_fnc=prewarm, 
            shutdown_process_timeout=10
        ),
    )
