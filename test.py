import os
from cerebras.cloud.sdk import Cerebras
from time import time

client = Cerebras(
    api_key=os.environ.get("csk-k5h52cj56kc9c54dw5hrph2286w3t9nmwv4x2df8nkfecf89"),
)

start_time = time()
stream = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Why is fast inference important?",
        }
    ],
    model="llama-4-scout-17b-16e-instruct",
    stream=True,
)

first_token_received = False

for chunk in stream:
    content = chunk.choices[0].delta.content or ""
    if content and not first_token_received:
        first_token_latency = time() - start_time
        print(f"\n\n⚡ First token latency: {first_token_latency:.3f} seconds\n")
        first_token_received = True

    # print(content, end="")