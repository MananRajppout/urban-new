import io
import modal
import numpy as np
import wave
from typing import AsyncGenerator
import asyncio
from time import time
# Create Modal image with required dependencies
image = modal.Image.debian_slim(python_version="3.12") \
    .apt_install("ffmpeg", "espeak-ng") \
    .pip_install(
        "torch", 
        "torchaudio", 
        "kokoro", 
        "misaki", 
        "fastapi", 
        "numpy", 
        "pydantic"
    )

app = modal.App("kokoro-tts-api", image=image)

with image.imports():
    from kokoro import KModel, KPipeline
    import torch
    from fastapi.responses import StreamingResponse
    from fastapi import HTTPException
    from fastapi.responses import Response

# Available voices mapping
VOICE_MAP = {
    'af_heart': '🇺🇸 🚺 Heart ❤️',
    'af_bella': '🇺🇸 🚺 Bella 🔥',
    'af_nicole': '🇺🇸 🚺 Nicole 🎧',
    'af_aoede': '🇺🇸 🚺 Aoede',
    'af_kore': '🇺🇸 🚺 Kore',
    'af_sarah': '🇺🇸 🚺 Sarah',
    'af_nova': '🇺🇸 🚺 Nova',
    'af_sky': '🇺🇸 🚺 Sky',
    'af_alloy': '🇺🇸 🚺 Alloy',
    'af_jessica': '🇺🇸 🚺 Jessica',
    'af_river': '🇺🇸 🚺 River',
    'am_michael': '🇺🇸 🚹 Michael',
    'am_fenrir': '🇺🇸 🚹 Fenrir',
    'am_puck': '🇺🇸 🚹 Puck',
    'am_echo': '🇺🇸 🚹 Echo',
    'am_eric': '🇺🇸 🚹 Eric',
    'am_liam': '🇺🇸 🚹 Liam',
    'am_onyx': '🇺🇸 🚹 Onyx',
    'am_santa': '🇺🇸 🚹 Santa',
    'am_adam': '🇺🇸 🚹 Adam',
    'bf_emma': '🇬🇧 🚺 Emma',
    'bf_isabella': '🇬🇧 🚺 Isabella',
    'bf_alice': '🇬🇧 🚺 Alice',
    'bf_lily': '🇬🇧 🚺 Lily',
    'bm_george': '🇬🇧 🚹 George',
    'bm_fable': '🇬🇧 🚹 Fable',
    'bm_lewis': '🇬🇧 🚹 Lewis',
    'bm_daniel': '🇬🇧 🚹 Daniel',
}

@app.cls(
    gpu="a100",
    scaledown_window=300,
    max_containers=10,
    max_concurrency=1,
)
class KokoroService:
    @modal.enter()
    def load(self):
        self.cuda_available = torch.cuda.is_available()
        print(f"Initializing models... CUDA available: {self.cuda_available}")
        self.model = KModel().to('cuda').eval() if self.cuda_available else KModel().to('cpu').eval()

        #pipeline
        self.pipelines = {lang_code: KPipeline(lang_code=lang_code, model=False) for lang_code in 'ab'}
        self.pipelines['a'].g2p.lexicon.golds['kokoro'] = 'kˈOkəɹO'
        self.pipelines['b'].g2p.lexicon.golds['kokoro'] = 'kˈQkəɹQ'
        
        # Preload all voices
        for voice in VOICE_MAP.keys():
            self.pipelines[voice[0]].load_voice(voice)

        print(f"Voices loaded successfully")
        
        
     

    @modal.fastapi_endpoint(docs=True, method="POST")
    def generate(self, item: dict):
        text = item.get("text")
        voice_id = item.get("voice_id", "af_heart")
        speed = item.get("speed", 1.0)
        sample_rate = int(item.get("sample_rate", 24000))

        if not text or not voice_id:
            raise HTTPException(status_code=400, detail="Text and voice_id are required")
        
        if voice_id not in VOICE_MAP:
            raise HTTPException(status_code=400, detail=f"Invalid voice_id: {voice_id}")
        
        pipeline = self.pipelines[voice_id[0]]
        pack = pipeline.load_voice(voice_id)


        audio_result = None
        tokens = None
        start_time = time()
        for _, ps, _ in pipeline(text, voice_id, speed):
            ref_s = pack[len(ps)-1]
            tokens = ps
            
            try:
                audio = self.model(ps, ref_s, speed)
                audio_result = audio.numpy()
            except Exception as e:
                if self.cuda_available:
                    # Fallback to CPU
                    print(f"CUDA inference failed: {e}. Falling back to CPU.")
                    self.model = KModel().to('cpu').eval()
                    audio = self.model(ps, ref_s, speed)
                    audio_result = audio.numpy()
                else:
                    raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
            break
        
        end_time = time()
        print(f"Time taken: {end_time - start_time} seconds")
        if audio_result is None:
            raise HTTPException(status_code=500, detail="Failed to generate audio")
        
        # Convert to WAV
        wav_bytes = self.audio_to_wav_bytes(audio_result, sample_rate)
        return StreamingResponse(
            io.BytesIO(wav_bytes),
            media_type="audio/wav",
            headers={
                "Content-Disposition": f'attachment; filename="tts_output.wav"'
            }
        )
        
    


    @modal.fastapi_endpoint(docs=True, method="POST")
    def stream(self, item: dict):
        text = item.get("text")
        voice_id = item.get("voice_id", "af_heart")
        speed = item.get("speed", 1.0)
        sample_rate = int(item.get("sample_rate", 24000))

        if not text or not voice_id:
            raise HTTPException(status_code=400, detail="Text and voice_id are required")
        
        if voice_id not in VOICE_MAP:
            raise HTTPException(status_code=400, detail=f"Invalid voice_id: {voice_id}")
        
        return StreamingResponse(
            self.audio_stream_generator(text, voice_id, speed, sample_rate),
            media_type="audio/wav",
            headers={
                "Content-Disposition": 'attachment; filename="tts_stream.wav"',
                "Cache-Control": "no-cache"
            }
        )
        
    

    @modal.fastapi_endpoint(docs=True, method="GET")
    def health(self):
        return Response(content="Hello, World!")


   
    def audio_to_wav_bytes(self, audio_array: np.ndarray, sample_rate: int = 24000) -> bytes:
        """Convert numpy audio array to WAV bytes"""
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            # Convert float32 to int16
            audio_int16 = (audio_array * 32767).astype(np.int16)
            wav_file.writeframes(audio_int16.tobytes())
        buffer.seek(0)
        return buffer.read()
    

    async def audio_stream_generator(self, text: str, voice: str, speed: float, sample_rate: int) -> AsyncGenerator[bytes, None]:
        """Generate audio stream"""
        pipeline = self.pipelines[voice[0]]
        pack = pipeline.load_voice(voice)
        model = self.model
        use_cuda = self.cuda_available
        start_time = time()
        for _, ps, _ in pipeline(text, voice, speed):
            ref_s = pack[len(ps)-1]
            
            try:
                audio = model(ps, ref_s, speed)
                audio_np = audio.numpy()
            except Exception as e:
                if use_cuda:
                    print(f"CUDA inference failed: {e}. Falling back to CPU.")
                    self.model = KModel().to('cpu').eval()
                    audio = model(ps, ref_s, speed)
                    audio_np = audio.numpy()
                else:
                    raise
            
            # Convert to WAV chunk
            wav_chunk = self.audio_to_wav_bytes(audio_np, sample_rate)
            yield wav_chunk
            end_time = time()
            print(f"Time taken: {end_time - start_time} seconds")
            # Small delay to prevent overwhelming the client
            await asyncio.sleep(0.01)