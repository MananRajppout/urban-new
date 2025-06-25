from dataclasses import dataclass
from typing import List, Optional

@dataclass
class WelcomeMessageFile:
    public_url: str
    publid_id: str

@dataclass
class CalendarTool:
    cal_api_key: str
    cal_event_type_id: str
    cal_timezone: str
    _id: str

@dataclass
class Assistant:
    welcome_message_file: WelcomeMessageFile
    _id: str
    user_id: str
    name: str
    base_prompt: str
    chatgpt_model: str
    who_speaks_first: str
    welcome_msg: str
    twilio_phone_number: str
    plivo_phone_number: str
    voice_engine_name: str
    voice_id: str
    voice_name: str
    call_transfer_prompt: str
    transfer_call_number: str
    privacy_setting: str
    ambient_sound: str
    ambient_sound_volume: float
    responsiveness: int
    interruption_sensitivity: int
    voice_speed: float
    voice_temperature: float
    reminder_interval: int
    reminder_count: int
    boosted_keywords: str
    fallback_voice_ids: str
    enable_backchannel: bool
    language: str
    enable_speech_normalization: bool
    end_call_duration: int
    calendar_tools: List[CalendarTool]
    created_time: str
    updated_time: str
    __v: int
    ambient_similarity: float
    ambient_stability: float
    STT_name: str
    welcome_message_text: str
    hang_up_prompt: str
    silence_1_speech: str
    silence_1_timeout: int
    silence_2_speech: str
    silence_2_timeout: int
    elevenlabs_api_key: str
    rime_api_key: str
