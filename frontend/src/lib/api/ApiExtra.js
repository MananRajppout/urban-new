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

export async function addInvite(first, last, email, phone, about) {
  let data = {
    user_requested_id: "",
    first_name: first,
    last_name: last,
    email: email,
    phone_number: phone,
    about: about,
  };

  return await AxiosInstance.post("/api/create-invite", data, header);
}

export async function getUserDetail() {
  return await AxiosInstance.get("/api/fetch-user-details", header);
}

export async function getRestriction() {
  return await AxiosInstance.get("/api/fetch-restriction", header);
}
export async function fetchWebsiteNotification() {
  return await AxiosInstance.get("/api/fetch-website-notification", header);
}

export async function deleteAccount() {
  return await AxiosInstance.post("/api/delete-user", {}, header);
}
export const seenWebsiteNotification = (notificationIds, userId) => {
  return AxiosInstance.post(
    "/api/seen-website-notification",
    { notification_ids: notificationIds, user_id: userId },
    header
  );
};

export async function sendOtp(email) {
  return await AxiosInstance.post(
    "/api/forget-profile",
    { email: email, action: "send_otp" },
    header
  );
}

export async function verifyOtp(email, otp) {
  return await AxiosInstance.post(
    "/api/forget-profile",
    { email: email, otp: otp, action: "accept_otp" },
    header
  );
}

export async function resetPassword(password) {
  return await AxiosInstance.post(
    "/api/reset-password",
    { new_password: password },
    header
  );
}

export async function subscribeEmail(email) {
  return await AxiosInstance.get("/api/email-subscribe?email=" + email, header);
}

export async function updateProfile(profileImage, name, email) {
  let data = {
    profile_image: profileImage,
    full_name: name,
    email: email,
  };

  return await AxiosInstance.post("/api/edit-user", data, header);
}

export async function sendContactUs(data) {
  return await AxiosInstance.post("/api/create-case-report", data, header);
}

export async function getPricingModel() {
  return await AxiosInstance.get(`/api/fetch-price-models`, header);
}


export async function getPricingModelVoiceAi() {
  return await AxiosInstance.get("/api/fetch-voice-ai-price-models", header);
}

export async function getPaymentSession(data) {
  return await AxiosInstance.post("/api/create-payment-session", data, header);
}

export async function getRazorpaySession(data) {
  return await AxiosInstance.post("/api/create-razorpay-session", data, header);
}

export async function getRazorpaySuccessCallback(data) {
  return await AxiosInstance.post("/api/razorpay-success-callback", data, header);
}

export async function getAllBlogs(search, page) {
  return await AxiosInstance.get(
    `/api/fetch-blogs?page=${page}&limit=10&search=${search}`,
    header
  );
}

export async function getSingleBlog(blogId) {
  return await AxiosInstance.get(`/api/fetch-blog/${blogId}`, header);
}

// calendly api

export async function getMeetingType(username) {
  return await AxiosInstance.get(
    `/api/calendly/event-types/${username}`,
    header
  );
}

export async function getMeetingSlots(
  uuid,
  startDate,
  endDate,
  timezone = "Asia/Calcutta"
) {
  // date string format: 2021-09-01
  return await AxiosInstance.get(
    `/api/calendly/available-slots/${uuid}?timezone=${timezone}&diagnostics=false&range_start=${startDate}&range_end=${endDate}&scheduling_link_uuid`,
    header
  );
}

export async function bookMeeting(
  dateTime,
  name,
  email,
  eventTypeId,
  chatbotId,
  timezone = "Asia/Calcutta"
) {
  // date string format: 2024-06-06T00:00:00+05:30

  const data = {
    start_time: dateTime,
    full_name: name,
    email: email,
    timezone: timezone,
    chatbot_id: chatbotId,
    event_type_uuid: eventTypeId,
  };
  return await AxiosInstance.post("/api/calendly/book-meeting", data, header);
}

export async function getIpDetails() {
  try {
    const res = await fetch("https://ipapi.co/json/", { timeout: 5000 });
    if (!res.ok) {
      console.error(`IP API returned status: ${res.status}`);
      return { error: true, message: "Failed to fetch IP details" };
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching IP details:", error);
    return { error: true, message: "Error fetching IP details" };
  }
}

export async function fetchBookingHistory(chatbotId, startTime, endTime) {
  return await AxiosInstance.get(
    `/api/calendly/fetch-user-appointments/${chatbotId}?startTime=${startTime}&endTime=${endTime}`,
    header
  );
}



//================================add get api for success stripe payment ==============================
export async function getStripeSucess(session_id, plan_type) {
  return await AxiosInstance.get(
    `/api/stripe-success-callback?session_id=${session_id}&plan_type=${plan_type}`,
    header
  );
}

//===========================================download invoice stripe=============================

//================================add get api for success stripe payment ==============================
export async function getDownloadInvoice(session_id) {
  return await AxiosInstance.get(
    `/api/download-invoice?sessionId=${session_id}`,
    header
  );


}

//================================get current plan details==============================
export async function getCurrentPlanDetails() {
  return await AxiosInstance.get('/api/current-plan', header);
}


//==========================paid due amount ==================================

// 📦 Axios Call
export async function checkDuePayment(planId) {
  return await AxiosInstance.get(`/api/check-due-payment`, {
    params: { planId },
    header
  });
}

export async function requestNumber() {
  return await AxiosInstance.get("/api/request-number", header);
}

export async function changePassword(oldPassword, newPassword) {
  let data = {
    old_password: oldPassword,
    new_password: newPassword,
  };
  return await AxiosInstance.post("/api/change-password", data, header);
}