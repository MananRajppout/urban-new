from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Any, List, Optional

import aiohttp
from livekit.agents import DEFAULT_API_CONNECT_OPTIONS, APIConnectOptions, tts, utils

from .log import logger
from .models import TTSEncoding, TTSLanguages, TTSVoices

NUM_CHANNELS = 1
SENTENCE_END_REGEX = re.compile(r'.*[-.—!?,;:…।|]$')
API_BASE_URL = "https://aivoiceagent--kokoro-tts-api-kokoroservice-stream.modal.run"


@dataclass
class _TTSOptions:
    sample_rate: int
    voice_id: TTSVoices
    api_key: str | None
    speed: Optional[float]
    add_wav_header: bool


class TTS(tts.TTS):
    def __init__(
        self,
        *,
        api_key: str | None = None,
        sample_rate: int = 24000,
        voice_id: TTSVoices = "af_heart",
        http_session: aiohttp.ClientSession | None = None,
        speed: float = 1.0
    ) -> None:
        """
        Create a new instance of smallest.ai Waves TTS.
        Args:
                sample_rate (int, optional): The audio sample rate in Hz. Defaults to 24000.
                voice_id (TTSVoices, optional): The voice settings to use. Defaults to "af_heart".
                api_key (str, optional): The smallest.ai API key. If not provided, it will be read from the SMALLEST_API_KEY environment variable.
                http_session (aiohttp.ClientSession | None, optional): An existing aiohttp ClientSession to use. If not provided, a new session will be created.
        """

        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False),
            sample_rate=sample_rate,
            num_channels=NUM_CHANNELS,
        )

        api_key = api_key or os.environ.get("KOKORO_API_KEY")
        

        self._opts = _TTSOptions(
            sample_rate=sample_rate,
            voice_id=voice_id,
            api_key=api_key,
            speed=speed,
            add_wav_header=False
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
    """Synthesize chunked text using the Waves API endpoint"""

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

        self._chunk_size = 80
        text_chunks = _split_into_chunks(self._text, self._chunk_size)

        for chunk in text_chunks:
            data = _to_kokoro_options(self._opts)
            data["text"] = chunk

            url = f"{API_BASE_URL}"
            headers = {
                "Authorization": f"Bearer {self._opts.api_key}",
                "Content-Type": "application/json",
            }

            async with self._session.post(url, headers=headers, json=data) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    raise Exception(
                        f"Kokoro API error: {resp.status} - {error_text}"
                    )

                async for data, _ in resp.content.iter_chunks():
                    for frame in bstream.write(data):
                        self._event_ch.send_nowait(
                            tts.SynthesizedAudio(
                                request_id=request_id,
                                segment_id=segment_id,
                                frame=frame,
                            )
                        )

                for frame in bstream.flush():
                    self._event_ch.send_nowait(
                        tts.SynthesizedAudio(
                            request_id=request_id, segment_id=segment_id, frame=frame
                        )
                    )


def _to_kokoro_options(opts: _TTSOptions) -> dict[str, Any]:
    return {
        "voice_id": opts.voice_id,
        "sample_rate": opts.sample_rate,
        "speed": opts.speed,
        "add_wav_header": opts.add_wav_header,
    }


def _split_into_chunks(text: str, chunk_size: int = 250) -> List[str]:
    chunks = []
    while text:
        if len(text) <= chunk_size:
            chunks.append(text.strip())
            break

        chunk_text = text[:chunk_size]
        last_break_index = -1

        # Find last sentence boundary using regex
        for i in range(len(chunk_text) - 1, -1, -1):
            if SENTENCE_END_REGEX.match(chunk_text[:i + 1]):
                last_break_index = i
                break

        if last_break_index == -1:
            # Fallback to space if no sentence boundary found
            last_space = chunk_text.rfind(' ')
            if last_space != -1:
                last_break_index = last_space 
            else:
                last_break_index = chunk_size - 1

        chunks.append(text[:last_break_index + 1].strip())
        text = text[last_break_index + 1:].strip()

    return chunks
