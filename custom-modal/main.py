import io
import modal
import numpy as np
import wave
from typing import AsyncGenerator
import asyncio
from time import time
import pickle
import os
import base64

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

def bake_models_into_image():
    """This function runs during image build time"""
    import torch
    from kokoro import KModel, KPipeline
    
    print("Baking models into image...")
    
    # Create directory for models
    os.makedirs("/opt/kokoro_models", exist_ok=True)
    
    # Load and save the main model
    print("Loading KModel...")
    model = KModel().eval()
    torch.save(model.state_dict(), "/opt/kokoro_models/kokoro_model.pth")
    
    # Load pipelines and voices
    print("Loading pipelines and voices...")
    pipelines_data = {}
    
    for lang_code in 'ab':
        pipeline = KPipeline(lang_code=lang_code, model=False)
        
        # Set lexicon
        if lang_code == 'a':
            pipeline.g2p.lexicon.golds['kokoro'] = 'kˈOkəɹO'
        else:
            pipeline.g2p.lexicon.golds['kokoro'] = 'kˈQkəɹQ'
        
        # Preload all voices for this language
        voices_data = {}
        for voice_name, voice_desc in VOICE_MAP.items():
            if voice_name[0] == lang_code:
                print(f"  Loading voice: {voice_name} ({voice_desc})")
                voice_pack = pipeline.load_voice(voice_name)
                voices_data[voice_name] = voice_pack
        
        pipelines_data[lang_code] = {
            'pipeline': pipeline,
            'voices': voices_data
        }
    
    # Save pipelines data
    with open("/opt/kokoro_models/pipelines.pkl", "wb") as f:
        pickle.dump(pipelines_data, f)
    
    print("Models successfully baked into image!")
    print(f"Model size: {os.path.getsize('/opt/kokoro_models/kokoro_model.pth') / 1024 / 1024:.2f} MB")
    print(f"Pipelines size: {os.path.getsize('/opt/kokoro_models/pipelines.pkl') / 1024 / 1024:.2f} MB")

# Create Modal image with models baked in
image = modal.Image.debian_slim(python_version="3.12") \
    .apt_install("ffmpeg", "espeak-ng") \
    .pip_install(
        "torch", 
        "torchaudio", 
        "kokoro", 
        "misaki", 
        "fastapi", 
        "numpy", 
        "pydantic",
        "pydub",
        "scipy"
    ) \
    .run_function(bake_models_into_image)  # This bakes models into the image

app = modal.App("kokoro-tts-api", image=image)

with image.imports():
    from kokoro import KModel, KPipeline
    import torch
    from fastapi.responses import StreamingResponse
    from fastapi import HTTPException
    from fastapi.responses import Response
    from pydub import AudioSegment
    from scipy.io.wavfile import write

@app.cls(
    gpu="a100",
    scaledown_window=600,  # Keep alive for 10 minutes
    max_containers=10,
    min_containers=1,  # Keep at least 1 container warm
    # region="us-west-1",
)

class KokoroService:
    @modal.enter()
    def load(self):
        """Fast loading from pre-baked models"""
        import torch
        from kokoro import KModel
        
        start_time = time()
        
        self.cuda_available = torch.cuda.is_available()
        device = 'cuda' if self.cuda_available else 'cpu'
        print(f"Loading from baked models... CUDA available: {self.cuda_available}")
        
        # Load model from disk (fast)
        self.model = KModel().to(device).eval()
        model_state = torch.load("/opt/kokoro_models/kokoro_model.pth", map_location=device)
        self.model.load_state_dict(model_state)
        
        # Load pipelines and voices from disk (fast)
        with open("/opt/kokoro_models/pipelines.pkl", "rb") as f:
            pipelines_data = pickle.load(f)
        
        self.pipelines = {}
        self.voice_packs = {}
        
        for lang_code, data in pipelines_data.items():
            self.pipelines[lang_code] = data['pipeline']
            for voice_name, voice_pack in data['voices'].items():
                self.voice_packs[voice_name] = voice_pack
        
        load_time = time() - start_time
        print(f"Models loaded successfully in {load_time:.2f} seconds!")

    @modal.fastapi_endpoint(docs=True, method="POST")
    def test(self, item: dict):
        return Response(content="Hello, World!", media_type="text/plain")

    @modal.fastapi_endpoint(docs=True, method="POST")
    def generate(self, item: dict):
        """Generate complete audio (non-streaming)"""
        text = item.get("text")
        voice_id = item.get("voice_id", "af_heart")
        speed = item.get("speed", 1.0)
        sample_rate = int(item.get("sample_rate", 24000))

        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        if voice_id not in VOICE_MAP:
            raise HTTPException(status_code=400, detail=f"Invalid voice_id: {voice_id}. Available voices: {list(VOICE_MAP.keys())}")
        
        pipeline = self.pipelines[voice_id[0]]
        pack = self.voice_packs[voice_id]  # Use pre-loaded voice pack

        audio_result = None
        start_time = time()
        
        # Process text through pipeline
        for _, ps, _ in pipeline(text, voice_id, speed):
            ref_s = pack[len(ps)-1]
            
            try:
                with torch.no_grad():  # Ensure no gradient computation
                    audio = self.model(ps, ref_s, speed)
                    audio_result = audio.cpu().numpy()  # Ensure it's on CPU
            except Exception as e:
                print(f"Inference error: {e}")
                raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
            break
        
        inference_time = time() - start_time
        print(f"Generated audio in {inference_time:.3f} seconds")
        
        if audio_result is None:
            raise HTTPException(status_code=500, detail="Failed to generate audio")
        
        # Convert to WAV
        start_time = time()
        wav_bytes = self.audio_to_wav_bytes(audio_result, sample_rate)
        conversion_time = time() - start_time
        print(f"Conversion to WAV took {conversion_time:.3f} seconds")
        
        # return StreamingResponse(
        #     io.BytesIO(wav_bytes),
        #     media_type="audio/wav",
        #     headers={
        #         "Content-Disposition": f'attachment; filename="tts_output.wav"',
        #         "X-Inference-Time": f"{inference_time:.3f}"
        #     }
        # )

        return {
            "audio": base64.b64encode(wav_bytes).decode('utf-8'),
            "inference_time": inference_time,
            "audio_size": len(wav_bytes)
        }

    @modal.fastapi_endpoint(docs=True, method="POST")
    def stream(self, item: dict):
        """Stream audio chunks as they're generated"""
        text = item.get("text")
        voice_id = item.get("voice_id", "af_heart")
        speed = item.get("speed", 1.0)
        sample_rate = int(item.get("sample_rate", 24000))
        add_wav_header = bool(item.get("add_wav_header", True))

        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        if voice_id not in VOICE_MAP:
            raise HTTPException(status_code=400, detail=f"Invalid voice_id: {voice_id}. Available voices: {list(VOICE_MAP.keys())}")
        
        return StreamingResponse(
            self.audio_stream_generator(text, voice_id, speed, sample_rate, add_wav_header),
            media_type="audio/mp3",
            headers={
                "Content-Disposition": 'attachment; filename="tts_stream.mp3"',
                "Cache-Control": "no-cache"
            }
        )

    @modal.fastapi_endpoint(docs=True, method="GET")
    def health(self):
        """Health check endpoint"""
        return {
            "status": "healthy",
            "cuda_available": self.cuda_available,
            "models_loaded": hasattr(self, 'model') and hasattr(self, 'pipelines'),
            "voices_available": len(self.voice_packs) if hasattr(self, 'voice_packs') else 0
        }

    @modal.fastapi_endpoint(docs=True, method="GET")
    def voices(self):
        """Get available voices"""
        return {
            "voices": VOICE_MAP,
            "total": len(VOICE_MAP)
        }

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




    async def audio_stream_generator(self, text: str, voice: str, speed: float, sample_rate: int, add_wav_header: bool) -> AsyncGenerator[bytes, None]:
        """Generate audio stream"""
        pipeline = self.pipelines[voice[0]]
        pack = self.voice_packs[voice]  # Use pre-loaded voice pack
        model = self.model
        
        s = time()
        # WAV header for streaming
        # We'll write a placeholder header first, then stream audio chunks
        if add_wav_header:
            wav_header = self._create_wav_header(sample_rate)
            yield wav_header
        
        chunk_count = 0
        total_samples = 0
        
        for _, ps, _ in pipeline(text, voice, speed):
            start_time = time()
            ref_s = pack[len(ps)-1]
            
            try:
                with torch.no_grad():  # Ensure no gradient computation
                    audio = model(ps, ref_s, speed)
                    audio_np = audio.cpu().numpy()  # Ensure it's on CPU
            except Exception as e:
                print(f"Inference error: {e}")
                raise
            
            
            audio_int16 = (audio_np * 32767).astype(np.int16)
            yield audio_int16.tobytes()




            
            
            inference_time = time() - start_time
            chunk_count += 1
            print(f"Chunk {chunk_count} generated in {inference_time:.3f}s ({len(audio_int16)} samples)")
            
            # Small delay to prevent overwhelming the client
            # await asyncio.sleep(0.001)

        print(f"Total time taken: {time() - s:.3f}s")

    def _create_wav_header(self, sample_rate: int, num_channels: int = 1, bits_per_sample: int = 16) -> bytes:
        """Create WAV header with placeholder for file size"""
        # WAV header is 44 bytes
        # We'll use maximum file size initially since we don't know the final size
        datasize = 0xFFFFFFFF - 44  # Maximum size
        
        o = bytes("RIFF", 'ascii')                                     # 0-3
        o += (datasize + 36).to_bytes(4, 'little')                    # 4-7 (file size - 8)
        o += bytes("WAVE", 'ascii')                                    # 8-11
        o += bytes("fmt ", 'ascii')                                    # 12-15
        o += (16).to_bytes(4, 'little')                               # 16-19 (fmt chunk size)
        o += (1).to_bytes(2, 'little')                                # 20-21 (PCM)
        o += (num_channels).to_bytes(2, 'little')                     # 22-23
        o += (sample_rate).to_bytes(4, 'little')                      # 24-27
        o += (sample_rate * num_channels * bits_per_sample // 8).to_bytes(4, 'little')  # 28-31 (byte rate)
        o += (num_channels * bits_per_sample // 8).to_bytes(2, 'little')  # 32-33 (block align)
        o += (bits_per_sample).to_bytes(2, 'little')                  # 34-35
        o += bytes("data", 'ascii')                                    # 36-39
        o += (datasize).to_bytes(4, 'little')                         # 40-43 (data size)
        
        return o