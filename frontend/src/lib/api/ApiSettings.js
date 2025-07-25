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

export async function getSettings() {
  return await AxiosInstance.get("/api/get-settings", header);
}

export async function updateSettings(dailySummary, callSummary, summaryEmail) {
  const data = {
    daily_summary: dailySummary,
    call_summary: callSummary,
    summary_email: summaryEmail,
  };
  return await AxiosInstance.post("/api/update-settings", data, header);
}

// Website Settings Functions
export async function getWebsiteSettings() {
  return await AxiosInstance.get("/api/get-website-name-and-logo", header);
}

export async function updateWebsiteSettings(websiteName, logoFile, contactEmail, metaDescription, liveDemoAgent, liveDemoPhoneNumber, policyText) {
  const data = {
    website_name: websiteName,
    contact_email: contactEmail,
    meta_description: metaDescription,
    live_demo_agent: liveDemoAgent,
    live_demo_phone_number: liveDemoPhoneNumber,
    policy_text: policyText
  };
  
  // If logo file is provided, convert it to base64
  if (logoFile) {
    const base64Logo = await fileToBase64(logoFile);
    data.logo = base64Logo;
  }
  
  return await AxiosInstance.post("/api/update-website-name-and-logo", data, header);
}

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Fetcher functions for SWR (optional, following the pattern from other API files)
export const websiteSettingsFetcher = async () => {
  const response = await getWebsiteSettings();
  return response.data;
}; 