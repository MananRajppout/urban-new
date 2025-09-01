import axios from "axios";
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

export async function addPurchasedTwilioNumber(purchasedTwilioNumber) {
  const data = {
    twilio_number: purchasedTwilioNumber,
  };

  return await AxiosInstance.post("/api/telnyx/buy-phone-number", data, header);
}

export async function buyPlivoNumber(countryISO) {
  const data = {
    countryISO,
  };

  return await AxiosInstance.post("/api/phone/numbers/buy", data, header);
}

export async function buyTwilioNumber(country) {
  let data;
  if (!country) {
    data = {};
  } else {
    data = {
      country: country,
    };
  }

  return await AxiosInstance.post("/api/telnyx/buy-phone-number", data, header);
}

export async function createAiAgent(
  base_prompt,
  chatgpt_model,
  temperature,
  welcome_msg,
  transfer_call_number,
  voice_id = "raman",
  voice_name = "Raman",
  voice_engine_name = "smallest"
) {
  const data = {
    base_prompt,
    chatgpt_model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    temperature,
    welcome_msg,
    voice_id: "aura-2-asteria-en",
    transfer_call_number,
    voice_name: "Asteria",
    voice_engine_name: "deepgram",
  };

  return await AxiosInstance.post("/api/create-ai-agent", data, header);
}

export async function updateAiAgent(agent_id, formData, { signal }={}) {
  return await AxiosInstance.post(
    `/api/update-ai-agent/${agent_id}`,
    formData,
    { header, signal }
  );
}

export async function fetchAiAgents() {
  return await AxiosInstance.post("/api/fetch-ai-agents");
}

export async function fetchSingleAgent(agentId) {
  return await AxiosInstance.post(`/api/fetch-ai-agent/${agentId}`);
}

export async function deleteAiAgent(agentId) {
  return await AxiosInstance.delete(`/api/delete-ai-agent/${agentId}`);
}

export async function fetchPhoneNumbers() {
  // return await AxiosInstance.post("/api/twilio/fetch-phone-numbers");
  return await AxiosInstance.get("/api/phone/numbers");
}
export async function fetchSinglePhoneNumber(phoneNumberId) {
  // return await AxiosInstance.post(`/api/twilio/fetch-phone-number/${phoneNumberId}`);
  return await AxiosInstance.get(`/api/phone/numbers/${phoneNumberId}`);
}

export async function searchPhoneNumbers(countryISO) {
  // return await AxiosInstance.post("/api/twilio/fetch-phone-numbers");
  return await AxiosInstance.get(
    "/api/phone/numbers/search?countryISO=" + countryISO
  );
}

export async function updatePhoneNumber(phoneNumberId, formData) {
  // return await AxiosInstance.put(`/api/twilio/update-phone-number/${phoneNumberId}`, formData, header);
  return await AxiosInstance.put(
    `/api/phone/agent/phone-number`,
    {
      ...formData,
      phone_number_id: phoneNumberId,
    },
    header
  );
}

export async function deletePlivoPhoneNumber(phoneNumber) {
  return await AxiosInstance.get(
    `/api/phone/numberdelete?number=${phoneNumber}`,
    header
  );
}

export async function deletePhoneNumber(phoneNumberId) {
  return await AxiosInstance.delete(
    `/api/delete-twilio-number/${phoneNumberId}`
  );
}

export async function makeOutboundCall(phoneNumber, agentId) {
  return await AxiosInstance.get(
    `/api/make-outbound-call?to_phone_number=${phoneNumber}&ai_agent_id=${agentId}`
  );
}
export async function makeOutboundCall2(from, to) {
  return await AxiosInstance.post(`/api/phone/call`, { from, to });
}



export async function generateWebCallAccessToken(agentId) {
  return await AxiosInstance.get(
    `/api/web-call/generate-access-token?agent_id=${agentId}`
  );
}

export async function fetchAllVoices() {
  return await AxiosInstance.get(`/api/fetch-all-voices`);
}

export async function generateLivekitToken(formData) {
  return await AxiosInstance.post(`/api/generate-livekit-token`,formData);
}

export async function fetchCallHistory() {
  return await AxiosInstance.get(`/api/fetch-call-history`);
}

export async function fetchCountryAndPhoneNumbersCosts() {
  return await AxiosInstance.get(`/api/telnyx/fetch-countries-and-costs`);
}

export async function fetchSingleCallHistory(id) {
  return await AxiosInstance.get(`/api/fetch-call-history/${id}`);
}

export async function saveCalBookingSettings(formData) {
  return await axios.post(
    `${process.env.NEXT_PUBLIC_CALL_SERVER}/save-cal-booking-settings`,
    formData,
    header
  );
}

export async function saveCalAvailabilitySettings(formData) {
  return await axios.post(
    `${process.env.NEXT_PUBLIC_CALL_SERVER}/save-cal-availability-settings`,
    formData,
    header
  );
}



export const fetcherAiAgent = async (agentId) => {
  try {
    const response = await fetchSingleAgent(agentId);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch agent data");
  }
};
