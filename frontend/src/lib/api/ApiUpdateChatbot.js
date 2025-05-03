import axios from "axios";
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

// export async function createChatbot() {

//   return await AxiosInstance.post("/api/create-chatbot", header);
// }

// export async function createChatSourceByFile(chatbotId, formData) {

//   return await AxiosInstance.post(`/api/chat-source-create?chatbot_id=${chatbotId}&source_type=file`, formData, header);
// }

// export async function createChatSourceByText(chatbotId, textData) {
//   const data = {
//     text_source: textData
//   }
//   return await AxiosInstance.post(`/api/chat-source-create?chatbot_id=${chatbotId}&source_type=text`, data, header);
// }

// export async function verifyLink(link, isSitemap = false){
//   const data = {
//     action: "fetch",
//     source_keys: [link]
//   }

//   if(isSitemap){
//     return await AxiosInstance.post(`/api/crawler?type=sitemap`, data, header);

//   }else{
//     return await AxiosInstance.post(`/api/crawler`, data, header);
//   }
// }

// export async function createChatSourceByLink(chatbotId, resData) {
//   const data = {
//     action: "push",
//     chatbot_id: chatbotId,
//     source_keys: resData
//   }

//   return await AxiosInstance.post(`/api/crawler`, data, header);
// }

// export async function createChatSourceByQuestion(chatbotId, answerArray) {
//   const data = {
//     qa_list : answerArray
//   }
//   return await AxiosInstance.post(`/api/chat-source-create?chatbot_id=${chatbotId}&source_type=qa`, data, header);
// }

export async function getChatbotById(id) {
  return await AxiosInstance.get(
    `/api/my-chatbots?type=full&chat_model_id=` + id,
    header
  );
}

export async function updateChatbotById(id, data) {
  return await AxiosInstance.post(
    `/api/edit-chatbot?chatbot_id=` + id,
    data,
    header
  );
}

export async function fetchChatbotSource(chatbotId, type, modelId = "") {
  // data_Type will be - detail, source
  return await AxiosInstance.get(
    `/api/fetch-chatbot-sources?chatbot_id=${chatbotId}&data_type=${type}&chat_bot_source_detail_id=${modelId}`,
    header
  );
}

export async function updateChatSource(
  chatbotId,
  chatbotSourceDetailId,
  updateData,
  type
) {
  const data = {
    chatbot_id: chatbotId,
    chat_bot_source_detail_id: chatbotSourceDetailId,
    updated_data: updateData,
    updated_data_type: type,
  };

  // chatbot_id, chat_bot_source_detail_id, updated_data,
  // updated_data_type: enum:[‘qa’, ‘text’]

  return await AxiosInstance.post(`/api/edit-chatbot-source`, data, header);
}

export async function deleteChatSource(chatbotId, chatbotSourceDetailId) {
  const data = {
    chatbot_id: chatbotId,
    chatbot_detail_ids: [chatbotSourceDetailId],
  };

  return await AxiosInstance.post(`/api//delete-chatbot-sources`, data, header);
}

export async function deleteChatbot(id) {
  return await AxiosInstance.delete(
    `/api/delete-chatbot?chat_model_id=${id}`,
    header
  );
}

export async function verifyWhatsapp(id) {
  return await AxiosInstance.get(
    "/api/whatsapp/details?chat_model_id=" + id,
    header
  );
}

export async function addWhatsappIntegration(id, data) {
  return await AxiosInstance.post(
    "/api/whatsapp/details?chat_model_id=" + id,
    data,
    header
  );
}

export async function removeWhatsappIntegration(id) {
  return await AxiosInstance.post(
    "/api/delete-integrate",
    { integrate_id: id },
    header
  );
}

export async function verifyFacebook(id) {
  return await AxiosInstance.get(
    "/api/facebook/details?integrate_type=facebook&chat_model_id=" + id,
    header
  );
}

export async function addFacebookIntegration(id, data) {
  return await AxiosInstance.post(
    "/api/facebook/details?integrate_type=facebook&chat_model_id" + id,
    data,
    header
  );
}

export async function createLead(chatbotId, email, name, phone, sessionId) {
  const data = {
    chat_model_id: chatbotId,
    email: email,
    name: name,
    phone_number: phone,
    chat_session_id: sessionId
  };
  return await AxiosInstance.post("/api/create-lead", data, header);
}

export async function fetchChatbotHistory(chatbotId, page, startTime, endTime) {
  return await AxiosInstance.get(
    `/api/fetch-chatbot-history?chat_model_id=${chatbotId}&page=${page}&startTime=${startTime}&endTime=${endTime}`,
    header
  );
}

export async function fetchLeadsHistory(chatbotId, startTime, endTime) {
  return await AxiosInstance.get(
    `/api/fetch-leads?chat_model_id=${chatbotId}&startTime=${startTime}&endTime=${endTime}`,
    header
  );
}

export async function deleteAllWebsiteLinks(chatbotId) {
  return await AxiosInstance.delete(`/api/delete-all-chatbot-sources/` + chatbotId, header);
}

export async function verifyDomainLink(url) {
  try {
    const res = await AxiosInstance.post("/api/verify-link", { url }, header);
    return res.data.verified;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// export async function deleteChatbot(id) {
//   return await AxiosInstance.get(`/api/my-chatbots?type=full&chat_model_id=` + id, header);
// }

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
