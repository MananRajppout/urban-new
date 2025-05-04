from .models import TTSEncoding, TTSModels, TTSLanguages, TTSVoices
from .tts import TTS
from .version import __version__

__all__ = [
    "TTS",
    "TTSEncoding",
    "TTSModels",
    "TTSLanguages",
    "TTSVoices",
    "__version__",
]

from livekit.agents import Plugin

from .log import logger


class SarvamPlugin(Plugin):
    def __init__(self):
        super().__init__(__name__, __version__, __package__, logger)


Plugin.register_plugin(SarvamPlugin())