from openai import OpenAI
import dotenv
import os
import json
dotenv.load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_call_summary(chat_history: list):
    chat_history_str = [f"{message.get('role')}: {message.get('content')}" for message in chat_history]
    chat_history_str = "\n".join(chat_history_str)

    prompt = f"""
        You are an AI assistant analyzing a conversation between a user and an AI agent. Based on the chat history provided below, generate:

        1. **Call Status** (Choose from: "Successful", "Unsuccessful")
        2. **User Sentiment** (Choose from: "Positive", "Neutral", "Negative")
        3. **Call Summary** (Concise summary of key points in the conversation)
        4. **Disconnection Reason** (If the conversation was completed, set this as "Agent ended the call". Otherwise, provide a brief reason, such as "User hung up", "Call dropped due to network issue", etc.)

        ### Chat History:
        {chat_history_str}

        ### Response Format:
        Your response must be a valid JSON object with the following structure:
        {{
        "call_status": "Successful" or "Unsuccessful",
        "user_sentiment": "Positive" or "Neutral" or "Negative",
        "summary": "Brief summary here",
        "disconnection_reason": "Brief reason why the call ended" 
        }}

        Important: Ensure your response contains ONLY the JSON object above without any additional text or formatting.
    """


    response = client.responses.create(
        model="gpt-4.1",
        input=[{"role": "system", "content": prompt}],
        temperature=0.3,
    )

    output = response.output_text
    result = json.loads(output)
    return result
    


def get_levels_summary(levels: list,chat_history: list):
    chat_history_str = [f"{message.get('role')}: {message.get('content')}" for message in chat_history]
    chat_history_str = "\n".join(chat_history_str)

    levels_str = [f"level:{level.get('name')}, Description: {level.get('description')}" for level in levels]
    levels_str = "\n".join(levels_str)

    prompt = f"""
    You are an AI assistant analyzing a conversation between a user and an AI agent. Based on the chat history provided below, generate:
    and provide level of of user interaction with the agent. in single word.

    Chat History:
    {chat_history_str}

    Levels:
    {levels_str}


    Important:
    - just choose one from the levels based on level description.
    - just return the level name, no other text or formatting. like level: level_name just return level_name.


    Example 1 Output:
       selled

    Example 2 Output:
       not_selled
       
    Example 3 Output:
       not_interested


    """

    response = client.responses.create(
        model="gpt-4.1",
        input=[{"role": "system", "content": prompt}],
        temperature=0.3,
    )

    output = response.output_text

    return output