import base64
import os
import re
from dataclasses import dataclass
from typing import Any, List, Optional

import aiohttp
from livekit.agents import DEFAULT_API_CONNECT_OPTIONS, APIConnectOptions, tts, utils

from .log import logger
from .models import TTSEncoding, TTSLanguages, TTSModels, TTSVoices

NUM_CHANNELS = 1
SENTENCE_END_REGEX = re.compile(r'.*[-.—!?,;:…।|]$')
SARVAM_API_URL = "https://api.sarvam.ai/text-to-speech"


@dataclass
class _TTSOptions:
    model: TTSModels
    encoding: TTSEncoding
    sample_rate: int
    voice: TTSVoices
    api_key: str
    language: TTSLanguages
    transliterate: Optional[bool]


class TTS(tts.TTS):
    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: TTSModels = "bulbul:v1",
        sample_rate: int = 24000,
        language: TTSLanguages = "en-IN",
        voice: TTSVoices = "Diya",
        transliterate: Optional[bool] = False,
        encoding: TTSEncoding = "wav",
        http_session: aiohttp.ClientSession | None = None,
    ) -> None:
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False),
            sample_rate=sample_rate,
            num_channels=NUM_CHANNELS,
        )

        api_key = api_key or os.environ.get("SARVAM_API_KEY")
        if not api_key:
            raise ValueError("SARVAM_API_KEY must be set")

        self._opts = _TTSOptions(
            model=model,
            language=language,
            encoding=encoding,
            sample_rate=sample_rate,
            voice=voice,
            api_key=api_key,
            transliterate=transliterate,
        )
        self._session = http_session

    def _ensure_session(self) -> aiohttp.ClientSession:
        if not self._session:
            self._session = utils.http_context.http_session()
        return self._session

    def synthesize(
        self,
        text: str,
        *,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> "ChunkedStream":
        return ChunkedStream(
            tts=self,
            text=text,
            conn_options=conn_options,
            opts=self._opts,
            session=self._ensure_session(),
        )


class ChunkedStream(tts.ChunkedStream):
    def __init__(
        self,
        tts: TTS,
        text: str,
        opts: _TTSOptions,
        conn_options: APIConnectOptions,
        session: aiohttp.ClientSession,
    ) -> None:
        super().__init__(tts=tts, input_text=text, conn_options=conn_options)
        self._text, self._opts, self._session = text, opts, session

    @utils.log_exceptions(logger=logger)
    async def _run(self):
        bstream = utils.audio.AudioByteStream(
            sample_rate=self._opts.sample_rate, num_channels=NUM_CHANNELS
        )
        request_id, segment_id = utils.shortuuid(), utils.shortuuid()
        text_chunks = _split_into_chunks(self._text, chunk_size=250)

        for chunk in text_chunks:
            data = _to_sarvam_request(self._opts, chunk)

            headers = {
                "api-subscription-key": f"{self._opts.api_key}",
                "Content-Type": "application/json",
            }

            async with self._session.post(SARVAM_API_URL, headers=headers, json=data) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    raise Exception(f"Sarvam API error: {resp.status} - {error_text}")

                result = await resp.json()
                audio_base64 = result.get("audios", [''])[0]
                audio_bytes = base64.b64decode(audio_base64)

                for frame in bstream.write(audio_bytes):
                    self._event_ch.send_nowait(
                        tts.SynthesizedAudio(request_id=request_id, segment_id=segment_id, frame=frame)
                    )

        for frame in bstream.flush():
            self._event_ch.send_nowait(
                tts.SynthesizedAudio(request_id=request_id, segment_id=segment_id, frame=frame)
            )


def _to_sarvam_request(opts: _TTSOptions, text: str) -> dict[str, Any]:
    return {
        "inputs": [text],
        "model": opts.model,
        "speaker": opts.voice,
        "target_language_code": opts.language,
        "pitch": 0,
        "pace": 1.2,
        "loudness": 1,
        "speech_sample_rate": 24000,
        "enable_preprocessing": True,
    }


def _split_into_chunks(text: str, chunk_size: int = 250) -> List[str]:
    chunks = []
    while text:
        if len(text) <= chunk_size:
            chunks.append(text.strip())
            break

        chunk_text = text[:chunk_size]
        last_break_index = -1

        for i in range(len(chunk_text) - 1, -1, -1):
            if SENTENCE_END_REGEX.match(chunk_text[:i + 1]):
                last_break_index = i
                break

        if last_break_index == -1:
            last_space = chunk_text.rfind(' ')
            last_break_index = last_space if last_space != -1 else chunk_size - 1

        chunks.append(text[:last_break_index + 1].strip())
        text = text[last_break_index + 1:].strip()

    return chunks
