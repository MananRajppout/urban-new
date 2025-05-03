import AxiosInstance from "../axios";

/*
Note: response structure
{
  data: null | any,
  code: number,
  message: string
}

url = "https://urbanchat.ai/api/chat-completion"


# Define the data to be sent in the POST request (in JSON format)
data = {
   "chatbot_id": "62cb5b53-81e2-4d09-8a41-7b374c830ac7",
   "messages": [{ "role": "user", "content":  "what is your name"}]
}


*/
const header = {
  headers: {
    "Content-Type": "application/json",
  },
};

export async function getChat(chatbotId, question, oldMessages = []) {
  const data = {
    chatbot_id: chatbotId,
    messages: [{ role: "user", content: question, Messages: oldMessages }],
  };

  return await AxiosInstance.post("/api/chat-completion", data, header);
}

export async function getChatbotSettings(id) {
  return await AxiosInstance.get(
    "/api/fetch-chatbot?chat_model_id=" + id,
    header
  );
}

export async function getChatSessionHistory(startDate, endDate, modelId, page = 1) {
  return await AxiosInstance.get(
    `/api/fetch-chatbot-history?startTime=${startDate}&endTime=${endDate}&chat_model_id=${modelId}&page=${page}`,
    header
  );
}

// export async function downloadChatHistory(startDate, endDate, modelId) {
//   return await AxiosInstance.get(
//     `/api/export-chat-history?startTime=${startDate}&endTime=${endDate}&chat_model_id=${modelId}`,
//     header
//   );
// }


export async function downloadChatHistory(startDate, endDate, modelId) {
  return await AxiosInstance.get(
    `/api/export-chat-history?startTime=${startDate}&endTime=${endDate}&chat_model_id=${modelId}`,
    {
      ...header, // Include your headers
      responseType: 'blob', // Ensure the response is treated as binary data
    }
  );
}



