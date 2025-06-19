import requests
import dotenv
from app_types.assistant_type import Assistant
import os
from app_types.callconfig_type import CallContext
from app_types.assistant_type import Assistant
from datetime import datetime, timezone
from livekit.agents.llm import ChatContext
from utils.get_call_summary import get_call_summary

dotenv.load_dotenv()
BACKEND_URL = os.getenv("BACKEND_SERVER_URL")


def fetch_assistant_id(assistant_id) -> Assistant | None:
    try:
        url = f"{BACKEND_URL}/api/fetch-ai-agent/{assistant_id}"
        response = requests.get(url)
        response = response.json()
        assistant: Assistant = response.get("ai_agents")
        return assistant
    except Exception as e:
        print(e)
        return None


def call_webhook_pickup(call_ctx: CallContext,assistant: Assistant):
    try:

        url = f"{BACKEND_URL}/api/webcall/webhook/pickup"
        start_time = datetime.now(timezone.utc).isoformat(timespec='milliseconds')
        start_time = start_time.replace("+00:00", "Z")
        data = {
            "agentId": call_ctx.get('agentId'),
            "callId": call_ctx.get('callId'),
            "callType": call_ctx.get('callType'),
            "user_id": assistant.get('user_id'),
            "start_time": start_time
        }

        response = requests.post(url,json=data)
        response = response.json()
        print(response,"response from pickup")
        return response
    except Exception as e:
        print(e)
        return None

def call_webhook_hangup(call_ctx: CallContext,assistant: Assistant,chat_ctx: ChatContext):
    try:
        chat_history = []
        for i,message in enumerate(chat_ctx.messages):
            if i == 0:
                continue
            chat_history.append({
                "role": "user" if message.role == "user" else "agent",
                "content": message.content
            })
            
        url = f"{BACKEND_URL}/api/webcall/webhook/hangup"
        end_time = datetime.now(timezone.utc).isoformat(timespec='milliseconds')
        end_time = end_time.replace("+00:00", "Z")
        analysis = get_call_summary(chat_history)
        data = {
            "agentId": call_ctx.get('agentId'),
            "callId": call_ctx.get('callId'),
            "callType": call_ctx.get('callType'),
            "chat_history": chat_history,
            "end_time": end_time,
            "user_id": assistant.get('user_id'),
            "summary": analysis.get('summary'),
            "call_status": "Successful",
            "user_sentiment": analysis.get('user_sentiment'),
            "voice_engine_id": "meera",
            "disconnection_reason": analysis.get('disconnection_reason'),
            "direction": "outbound" if call_ctx.get('callId') == 'web' else call_ctx.get('dir'),
            "from": None if call_ctx.get('phone_number') == '' else call_ctx.get('phone_number'),
            "to": None if call_ctx.get('to_phone_number') == '' else call_ctx.get('to_phone_number')
        }
        response = requests.post(url,json=data)
        response = response.json()
        print(response,"response from hangup")
        return response
    except Exception as e:
        print(e)
        return None

def get_request(url:str):
    try:
        response = requests.get(url)
        response = response.json()
        return response
    except Exception as e:
        print(e)
        return None
    
def post_request(url:str,json):
    try:
        response = requests.post(url,json=json)
        response = response.json()
        return response
    except Exception as e:
        print(e)
        return None
