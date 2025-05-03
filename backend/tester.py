import requests

# Define the API endpoint URL
url = "http://localhost:8080/api/chat-completion"

# Define the data to be sent in the POST request (in JSON format)
data = {
    "chatbot_id":"11d9c474-5b61-4adf-9e6f-8b1a02011c81",
    "messages": [{ "role": "user", "content":  "tell me about green super market"}],
    "chat_session_id":"9d99a837-25c2-4511-ba28-ade6dd368168"
}
# Send the POST request
response = requests.post(url, json=data)

# Check the response
if response.status_code == 200:  # Replace 200 with the expected status code
    print("POST request was successful.")
    print("Response:", response.text)
else:
    print("POST request failed with status code:", response.status_code)
    print("Response:", response.text)
