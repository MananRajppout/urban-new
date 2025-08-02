# import io
# import modal
# import numpy as np
# import wave
# from typing import AsyncGenerator
# import asyncio
# import json
# from time import time
# # Create Modal image with required dependencies
# image = modal.Image.debian_slim(python_version="3.12") \
#     .apt_install("ffmpeg", "espeak-ng") \
#     .pip_install(
#         "torch", 
#         "torchaudio", 
#         "kokoro", 
#         "misaki", 
#         "fastapi", 
#         "numpy", 
#         "pydantic"
#     )

# app = modal.App("kokoro-tts-api", image=image)


# #Available voices mapping
# VOICE_MAP = {
#     'af_heart': '🇺🇸 🚺 Heart ❤️',
#     'af_bella': '🇺🇸 🚺 Bella 🔥',
#     'af_nicole': '🇺🇸 🚺 Nicole 🎧',
#     'af_aoede': '🇺🇸 🚺 Aoede',
#     'af_kore': '🇺🇸 🚺 Kore',
#     'af_sarah': '🇺🇸 🚺 Sarah',
#     'af_nova': '🇺🇸 🚺 Nova',
#     'af_sky': '🇺🇸 🚺 Sky',
#     'af_alloy': '🇺🇸 🚺 Alloy',
#     'af_jessica': '🇺🇸 🚺 Jessica',
#     'af_river': '🇺🇸 🚺 River',
#     'am_michael': '🇺🇸 🚹 Michael',
#     'am_fenrir': '🇺🇸 🚹 Fenrir',
#     'am_puck': '🇺🇸 🚹 Puck',
#     'am_echo': '🇺🇸 🚹 Echo',
#     'am_eric': '🇺🇸 🚹 Eric',
#     'am_liam': '🇺🇸 🚹 Liam',
#     'am_onyx': '🇺🇸 🚹 Onyx',
#     'am_santa': '🇺🇸 🚹 Santa',
#     'am_adam': '🇺🇸 🚹 Adam',
#     'bf_emma': '🇬🇧 🚺 Emma',
#     'bf_isabella': '🇬🇧 🚺 Isabella',
#     'bf_alice': '🇬🇧 🚺 Alice',
#     'bf_lily': '🇬🇧 🚺 Lily',
#     'bm_george': '🇬🇧 🚹 George',
#     'bm_fable': '🇬🇧 🚹 Fable',
#     'bm_lewis': '🇬🇧 🚹 Lewis',
#     'bm_daniel': '🇬🇧 🚹 Daniel',
# }



# with image.imports():
#     from kokoro import KModel, KPipeline
#     import torch
#     from fastapi.responses import StreamingResponse
#     from fastapi import HTTPException
#     from fastapi.responses import Response
#     from fastapi import FastAPI, Response, WebSocket, WebSocketDisconnect



# @app.cls(
#     gpu="a10g",
#     scaledown_window=300,
#     max_containers=10,
#     min_containers=1,
# )
# class KokoroService:
#     @modal.enter()
#     def load(self):
#         self.cuda_available = torch.cuda.is_available()
#         print(f"Initializing models... CUDA available: {self.cuda_available}")
#         self.model = KModel().to('cuda').eval() if self.cuda_available else KModel().to('cpu').eval()

#         #pipeline
#         self.pipelines = {lang_code: KPipeline(lang_code=lang_code, model=False) for lang_code in 'ab'}
#         self.pipelines['a'].g2p.lexicon.golds['kokoro'] = 'kˈOkəɹO'
#         self.pipelines['b'].g2p.lexicon.golds['kokoro'] = 'kˈQkəɹQ'
        
#         # Preload all voices
#         for voice in VOICE_MAP.keys():
#             self.pipelines[voice[0]].load_voice(voice)

#         print(f"Voices loaded successfully")
      
        
    

#     @modal.asgi_app(label="kokoro-tts-api")
#     def api(self):
#         app = FastAPI()

      

#         @app.websocket("/ws")
#         async def websocket_endpoint(websocket: WebSocket):
#             print("WebSocket connected")
#             await websocket.accept()


#             # Initialize queues
#             query = websocket.query_params
#             voice = query.get("voice", "af_heart")
#             speed = query.get("speed", 1.0)
#             sample_rate = int(query.get("sample_rate", "24000"))

#             print(f"Voice: {voice}, Speed: {speed}, Sample Rate: {sample_rate}")

#             text_queue = asyncio.Queue()
#             audio_queue = asyncio.Queue()
#             tasks = []

#             async def recv_loop():
#                 """
#                 Recieve text from websocketq
#                 """
#                 nonlocal text_queue
#                 while True:
#                     msg = await websocket.receive()
#                     if msg["type"] == "websocket.receive":
#                         text_data = msg.get("text")

#                         if text_data is not None:
#                             json_data = {}
#                             try:
#                                json_data = json.loads(text_data)
#                             except:
#                                 await websocket.send_text(json.dumps({"event": "error", "message": "Invalid JSON"}))
#                                 print("Invalid JSON")
#                                 continue
                            
#                             event = json_data.get("event")
#                             if event == "speak":
#                                 text = json_data.get("text")
#                                 text_queue.put_nowait(text)
#                             elif event == "flush":
#                                 text_queue.put_nowait(None)
                            

#                     elif msg["type"] == "websocket.disconnect":
#                         break
                    

#             async def inference_loop():
#                 """
#                 Generate audio from text
#                 """
#                 nonlocal text_queue, audio_queue
#                 while True:
#                     data = await text_queue.get()
#                     if data != None:
#                         async for chunk in self.audio_stream_generator(data, voice, speed, sample_rate):
#                             audio_queue.put_nowait(chunk)
                        
                    

#             async def send_loop():
#                 """
#                 Send audio to websocket
#                 """
#                 nonlocal audio_queue
#                 while True:
#                     data = await audio_queue.get()
#                     await websocket.send_bytes(data)

#             # run all loops concurrently
#             try:
#                 tasks = [
#                     asyncio.create_task(recv_loop()),
#                     asyncio.create_task(inference_loop()),
#                     asyncio.create_task(send_loop()),
#                 ]
#                 await asyncio.gather(*tasks)

#             except WebSocketDisconnect:
#                 print("WebSocket disconnected")
#                 await websocket.close(code=1000)
#             except Exception as e:
#                 print("Exception:", e)
#                 await websocket.close(code=1011)  # internal error
#                 raise e
#             finally:
#                 for task in tasks:
#                     task.cancel()
#                 await asyncio.gather(*tasks, return_exceptions=True)
            

           

#         @app.get("/health")
#         def health():
#             return Response(content="Hello, World!")

#         return app 
   
#     def audio_to_wav_bytes(self, audio_array: np.ndarray, sample_rate: int = 24000) -> bytes:
#         """Convert numpy audio array to WAV bytes"""
#         buffer = io.BytesIO()
#         with wave.open(buffer, 'wb') as wav_file:
#             wav_file.setnchannels(1)  # Mono
#             wav_file.setsampwidth(2)  # 16-bit
#             wav_file.setframerate(sample_rate)
#             # Convert float32 to int16
#             audio_int16 = (audio_array * 32767).astype(np.int16)
#             wav_file.writeframes(audio_int16.tobytes())
#         buffer.seek(0)
#         return buffer.read()
    

#     async def audio_stream_generator(self, text: str, voice: str, speed: float, sample_rate: int) -> AsyncGenerator[bytes, None]:
#         """Generate audio stream"""
#         pipeline = self.pipelines[voice[0]]
#         pack = pipeline.load_voice(voice)
#         model = self.model
#         use_cuda = self.cuda_available
#         start_time = time()
#         for _, ps, _ in pipeline(text, voice, speed):
#             ref_s = pack[len(ps)-1]
            
#             try:
#                 audio = model(ps, ref_s, speed)
#                 audio_np = audio.numpy()
#             except Exception as e:
#                 if use_cuda:
#                     print(f"CUDA inference failed: {e}. Falling back to CPU.")
#                     self.model = KModel().to('cpu').eval()
#                     audio = model(ps, ref_s, speed)
#                     audio_np = audio.numpy()
#                 else:
#                     raise
            
#             # Convert to WAV chunk
#             wav_chunk = self.audio_to_wav_bytes(audio_np, sample_rate)
#             yield wav_chunk
#             end_time = time()
#             print(f"Time taken: {end_time - start_time} seconds")
#             # Small delay to prevent overwhelming the client
#             await asyncio.sleep(0.001)





import io
import modal
import numpy as np
import wave
from typing import AsyncGenerator
import asyncio
import json
from time import time
import pickle
import os

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
        "pydantic"
    ) \
    .run_function(bake_models_into_image)  # This bakes models into the image

app = modal.App("kokoro-tts-api", image=image)

# Import inside the image context
with image.imports():
    from kokoro import KModel, KPipeline
    import torch
    from fastapi.responses import StreamingResponse
    from fastapi import HTTPException
    from fastapi.responses import Response
    from fastapi import FastAPI, Response, WebSocket, WebSocketDisconnect

@app.cls(
    gpu="a10g",
    scaledown_window=600,  # Keep alive for 10 minutes
    max_containers=10,
    min_containers=2,  # Keep 2 containers warm
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

    @modal.asgi_app(label="kokoro-tts-api")
    def api(self):
        app = FastAPI()

        @app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            print("WebSocket connected")
            await websocket.accept()

            # Initialize parameters
            query = websocket.query_params
            voice = query.get("voice", "af_heart")
            speed = float(query.get("speed", 1.0))
            sample_rate = int(query.get("sample_rate", "24000"))

            print(f"Voice: {voice}, Speed: {speed}, Sample Rate: {sample_rate}")

            # Validate voice
            if voice not in VOICE_MAP:
                await websocket.send_text(json.dumps({"event": "error", "message": f"Invalid voice: {voice}"}))
                await websocket.close()
                return

            text_queue = asyncio.Queue()
            audio_queue = asyncio.Queue()
            tasks = []

            async def recv_loop():
                """Receive text from websocket"""
                nonlocal text_queue
                try:
                    while True:
                        msg = await websocket.receive()
                        if msg["type"] == "websocket.receive":
                            text_data = msg.get("text")

                            if text_data is not None:
                                try:
                                    json_data = json.loads(text_data)
                                except json.JSONDecodeError:
                                    await websocket.send_text(json.dumps({"event": "error", "message": "Invalid JSON"}))
                                    continue
                                
                                event = json_data.get("event")
                                if event == "speak":
                                    text = json_data.get("text")
                                    if text:
                                        await text_queue.put(text)
                                elif event == "flush":
                                    await text_queue.put(None)
                        elif msg["type"] == "websocket.disconnect":
                            break
                except WebSocketDisconnect:
                    pass

            async def inference_loop():
                """Generate audio from text"""
                nonlocal text_queue, audio_queue
                try:
                    while True:
                        data = await text_queue.get()
                        if data is not None:
                            async for chunk in self.audio_stream_generator(data, voice, speed, sample_rate):
                                await audio_queue.put(chunk)
                        else:
                            # Flush signal - could add end-of-stream marker if needed
                            pass
                except asyncio.CancelledError:
                    pass

            async def send_loop():
                """Send audio to websocket"""
                nonlocal audio_queue
                try:
                    while True:
                        data = await audio_queue.get()
                        await websocket.send_bytes(data)
                except asyncio.CancelledError:
                    pass

            # Run all loops concurrently
            try:
                tasks = [
                    asyncio.create_task(recv_loop()),
                    asyncio.create_task(inference_loop()),
                    asyncio.create_task(send_loop()),
                ]
                await asyncio.gather(*tasks)

            except WebSocketDisconnect:
                print("WebSocket disconnected")
            except Exception as e:
                print(f"WebSocket error: {e}")
                await websocket.send_text(json.dumps({"event": "error", "message": str(e)}))
            finally:
                # Cancel all tasks
                for task in tasks:
                    task.cancel()
                await asyncio.gather(*tasks, return_exceptions=True)
                
                # Close websocket if still open
                try:
                    await websocket.close()
                except:
                    pass

        @app.get("/health")
        def health():
            return {"status": "healthy", "cuda_available": self.cuda_available}

        @app.get("/voices")
        def get_voices():
            """Return available voices"""
            return {"voices": VOICE_MAP}

        return app
   
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
        pack = self.voice_packs[voice]  # Use pre-loaded voice pack
        model = self.model
        
        chunk_count = 0
        for _, ps, _ in pipeline(text, voice, speed):
            start_time = time()
            ref_s = pack[len(ps)-1]
            
            try:
                with torch.no_grad():  # Ensure no gradient computation
                    audio = model(ps, ref_s, speed)
                    audio_np = audio.cpu().numpy()  # Ensure it's on CPU for numpy conversion
            except Exception as e:
                print(f"Inference error: {e}")
                raise
            
            # Convert to WAV chunk
            wav_chunk = self.audio_to_wav_bytes(audio_np, sample_rate)
            
            inference_time = time() - start_time
            chunk_count += 1
            print(f"Chunk {chunk_count} generated in {inference_time:.3f}s")
            
            yield wav_chunk
            
            # Small delay to prevent overwhelming the client
            await asyncio.sleep(0.001)

# For testing the baking process locally
if __name__ == "__main__":
    # You can test the baking function locally
    # bake_models_into_image()
    pass