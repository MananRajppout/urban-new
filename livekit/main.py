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
    metrics,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, openai, silero, smallest, elevenlabs, sarvam
from livekit.plugins.deepgram import tts
from services.assistant_function_service import AssistantFnc
from app_types.assistant_type import Assistant
from app_types.callconfig_type import CallContext
from services.api_service import (
    fetch_assistant_id,
    call_webhook_pickup,
    call_webhook_hangup,
)
from utils.generate_prompt import generate_prompt
from livekit.agents import tokenize
from time import time

import json
from livekit.plugins import groq
from livekit.plugins import noise_cancellation


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
        return deepgram.TTS(model=voice_id, encoding="linear16")
    elif tts_engine_name == "sarvam":
        return sarvam.TTS(
            speaker=voice_id, 
            target_language_code="en-IN", 
            model="bulbul:v1"
        )
    elif tts_engine_name == "smallest":
        return smallest.TTS(voice=voice_id)
    elif tts_engine_name == "elevenlabs":
        return elevenlabs.TTS(api_key=assistant_info.get("elevenlabs_api_key"))
    else:
        # Default to fastest option
        return deepgram.TTS(model="aura-asteria-en")


async def create_llm_engine(assistant_info: Assistant):
    """Create LLM engine with optimized settings"""
    gpt_model = assistant_info.get("chatgpt_model", "gpt-4o-mini")
    
    # Optimized LLM settings for speed
    base_config = {
        "parallel_tool_calls": True,
        "max_tokens": 150,  # Limit response length for faster generation
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
    
    elif gpt_model == "deepseek-r1-distill-llama-70b":
        return groq.LLM(model="deepseek-r1-distill-llama-70b", **base_config)
    
    elif gpt_model == "qwen/qwen3-32b":
        return groq.LLM(model="qwen/qwen3-32b", **base_config)
    
    else:
        return groq.LLM(model="llama-3.1-8b-instant", **base_config)


async def get_assistant_info(proc_userdata: dict, agent_id: str) -> Assistant | None:
    """Get assistant info with caching for faster retrieval"""
    cache = proc_userdata["assistant_cache"]
    
    if agent_id in cache:
        logger.info(f"Using cached assistant info for {agent_id}")
        return cache[agent_id]
    
    assistant_info = fetch_assistant_id(agent_id)
    if assistant_info:
        cache[agent_id] = assistant_info
        logger.info(f"Cached assistant info for {agent_id}")
    
    return assistant_info


async def entrypoint(ctx: JobContext):
    timing = {"start": time()}
    
    # Initialize connection
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for participant with timeout
    try:
        participant = await asyncio.wait_for(
            ctx.wait_for_participant(), 
            timeout=10.0
        )
        timing["participant_connected"] = time()
        logger.info(f"Participant connected in {timing['participant_connected'] - timing['start']:.3f}s")
    except asyncio.TimeoutError:
        logger.error("Participant connection timeout")
        await ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name))
        return

    # Initialize function context
    fnc_ctx = AssistantFnc(ctx.room.name, participant.identity)
    logger.info(f"starting voice assistant for participant {participant.identity}")

    # Parse call metadata
    call_ctx: CallContext = {}
    try:
        call_ctx = json.loads(
            participant.metadata if participant.metadata else participant.name
        )
    except Exception as e:
        logger.error(f"error parsing metadata: {e}")
        await ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name))
        return
    
    logger.info(f"call_ctx: {call_ctx}")

    # Get assistant info (with caching)
    timing["assistant_fetch_start"] = time()
    assistant_info = await get_assistant_info(ctx.proc.userdata, call_ctx.get("agentId"))
    if assistant_info is None:
        logger.error(f"assistant info not found for {call_ctx.get('agentId')}")
        await ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name))
        return
    
    timing["assistant_fetched"] = time()
    logger.info(f"Assistant info loaded in {timing['assistant_fetched'] - timing['assistant_fetch_start']:.3f}s")

    # Create initial chat context
    initial_ctx = llm.ChatContext().append(
        role="system", text=generate_prompt(assistant_info,call_ctx)
    )

    # Initialize TTS and LLM engines in parallel for faster setup
    timing["engines_start"] = time()
    tts_task = asyncio.create_task(create_tts_engine(assistant_info))
    llm_task = asyncio.create_task(create_llm_engine(assistant_info))
    
    tts, gpt_llm = await asyncio.gather(tts_task, llm_task)
    timing["engines_ready"] = time()
    logger.info(f"Engines initialized in {timing['engines_ready'] - timing['engines_start']:.3f}s")

    # Use faster STT model
    dg_model = "nova-2-general"  # Faster than nova-3

    def replace_words(assistant: VoicePipelineAgent, text: str):
        return tokenize.utils.replace_words(text=text, replacements={r"\*": " "})

    # Create voice pipeline agent
    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(language="hi", model=dg_model,smart_format=False,punctuate=False,filler_words=False),
        llm=gpt_llm,
        before_tts_cb=replace_words,
        tts=tts,
        chat_ctx=initial_ctx,
        fnc_ctx=fnc_ctx,
        noise_cancellation=noise_cancellation.BVC()
    )



    # Start agent
    agent.start(ctx.room, participant)
    timing["agent_started"] = time()

    # Start welcome message immediately (non-blocking)
    welcome_task = asyncio.create_task(
        agent.say(
            assistant_info.get("welcome_message_text"), 
            allow_interruptions=True
        )
    )

    # Register functions while welcome message is playing
    fnc_ctx.register(
        agent=agent,
        chat_ctx=initial_ctx,
        ctx=ctx,
        assistant_info=assistant_info,
        call_ctx=call_ctx,
    )

    # Wait for welcome message to complete
    await welcome_task
    timing["welcome_complete"] = time()
    
    logger.info(f"Total setup time: {timing['welcome_complete'] - timing['start']:.3f}s")

    # Enhanced event handling with detailed timing
    @agent.on("user_started_speaking")
    def user_started_speaking():
        timing["user_speech_start"] = time()
        logger.info("User speaking started")

    @agent.on("user_stopped_speaking")
    def user_stopped_speaking():
        timing["user_speech_end"] = time()
        timing["stt_start"] = time()
        speech_duration = timing["user_speech_end"] - timing["user_speech_start"]
        logger.info(f"User speaking stopped (duration: {speech_duration:.3f}s)")

    @agent.on("agent_started_speaking")
    def agent_started_speaking():
        timing["agent_speech_start"] = time()
        
        # Calculate response components timing
        if "stt_start" in timing:
            total_response_time = timing["agent_speech_start"] - timing["user_speech_end"]
            logger.info(f"Total response time: {total_response_time:.3f}s")
            
        logger.info("Agent speaking started")

    @agent.on("agent_stopped_speaking")
    def agent_stopped_speaking():
        if "agent_speech_start" in timing:
            speech_duration = time() - timing["agent_speech_start"]
            logger.info(f"Agent speaking stopped (duration: {speech_duration:.3f}s)")

    # Enhanced disconnect handling
    async def log_usage():
        disconnect_time = time()
        total_session_time = disconnect_time - timing["start"]
        
        logger.info(f"User disconnected after {total_session_time:.3f}s")
        logger.info("Session timing summary:")
        logger.info(f"  - Setup: {timing.get('welcome_complete', 0) - timing['start']:.3f}s")
        logger.info(f"  - Participant connection: {timing['participant_connected'] - timing['start']:.3f}s")
        logger.info(f"  - Assistant fetch: {timing['assistant_fetched'] - timing['assistant_fetch_start']:.3f}s")
        logger.info(f"  - Engine init: {timing['engines_ready'] - timing['engines_start']:.3f}s")
        
        # Call webhook hangup
        call_webhook_hangup(call_ctx, assistant_info, initial_ctx)

    # Handle web call pickup webhook
    if call_ctx.get("callType") == "web":
        logger.info("Web call detected")
        # Call webhook in background to avoid blocking
        asyncio.create_task(
            asyncio.to_thread(call_webhook_pickup, call_ctx, assistant_info)
        )

    # Register shutdown callback
    ctx.add_shutdown_callback(log_usage)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint, 
            prewarm_fnc=prewarm, 
            shutdown_process_timeout=2
        ),
    )