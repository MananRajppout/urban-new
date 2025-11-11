import os
import json
import redis
from dotenv import load_dotenv

load_dotenv()

r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASS"),
    username=os.getenv("REDIS_USER"),
    decode_responses=True  # returns string instead of bytes
)

def publish_call_complete(call_id, status):
    payload = {
        "callId": call_id,
        "status": status
    }
    # Publish to same channel Node.js subscriber is listening on
    r.publish("call:complete", json.dumps(payload))
    print(f"📢 Published to Redis: {payload}")