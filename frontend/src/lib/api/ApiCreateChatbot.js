import AxiosInstance from "../axios";


/*
Note: response structure
{
  data: null | any,
  code: number,
  message: string
}

*/
const header = {
  headers: {
    "Content-Type": "application/json",
  },
};

export async function createChatbot() {

  return await AxiosInstance.post("/api/create-chatbot", header);
}


export async function createChatSourceByFile(chatbotId, formData) {

  return await AxiosInstance.post(`/api/chat-source-create?chatbot_id=${chatbotId}&source_type=file`, formData, header);
}

export async function createChatSourceByText(chatbotId, textData) {
  const data = {
    text_source: textData
  }
  return await AxiosInstance.post(`/api/chat-source-create?chatbot_id=${chatbotId}&source_type=text`, data, header);
}


export async function verifyLink(link, isSitemap = false) {
  const data = {
    action: "fetch",
    source_keys: [link],
    site_map: isSitemap
  }

  return await AxiosInstance.post(`/api/crawler`, data, header);

  // if(isSitemap){
  //   return await AxiosInstance.post(`/api/crawler?type=sitemap`, data, header);

  // }else{

  // }
}

export async function createChatSourceByLink(chatbotId, resData) {
  const data = {
    action: "push",
    chatbot_id: chatbotId,
    source_keys: resData
  }


  return await AxiosInstance.post(`/api/crawler`, data, header);
}


export async function createChatSourceByQuestion(chatbotId, answerArray) {
  const data = {
    qa_list: answerArray
  }
  return await AxiosInstance.post(`/api/chat-source-create?chatbot_id=${chatbotId}&source_type=qa`, data, header);
}



export async function getAllMyChatbot() {

  return await AxiosInstance.get(`/api/my-chatbots?type=summary`, header);
}



export async function fetchYoutube(link, chatbotId) {
  const data = {
    action: "fetch",
    url: link,
    chatbot_id: chatbotId
  }

  return await AxiosInstance.post(`/api/youtube-transcript`, data, header);
}


export async function createChatSourceByYoutube(chatbotId, resData) {
  const data = {
    action: "push",
    chatbot_id: chatbotId,
    source_keys: resData
  }

  return await AxiosInstance.post(`/api/youtube-transcript`, data, header);
}







//   export async function getPayoutHistory(sortBy: string, sortOrder: string, page: number, perPage: number, status: string) {
//     return await AxiosInstance.get(`/api/get-payouts?sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&perpage=${perPage}&status=${status}`, header) as any as AxiosResult<PayoutHistoryData>;
//   }

//   export async function updatePayoutStatus(payoutId: string, status: string, transactionId: string) {
//     let data = {
//       status,
//       transaction_id: transactionId
//     };
//     return await AxiosInstance.put('/api/update-payout-status/' + payoutId, data, header) as any as AxiosResult<any>;
//   }



