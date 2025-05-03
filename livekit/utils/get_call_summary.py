

def get_call_summary(chat_history: list):
    chat_history_str = [f"{message.role}: {message.content}" for message in chat_history_str]
    chat_history_str = "\n".join(chat_history_str)

    return {
        "summary": "Test summary",
        "user_sentiment": "Positive",
        "disconnection_reason": "Test disconnection reason"
    }
