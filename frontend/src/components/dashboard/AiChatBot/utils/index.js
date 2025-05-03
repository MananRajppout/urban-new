const data = [
  { name: "Jan", messages: 3400, tokens: 120000, sessions: 850 },
  { name: "Feb", messages: 2500, tokens: 90000, sessions: 620 },
  { name: "Mar", messages: 4800, tokens: 180000, sessions: 1200 },
  { name: "Apr", messages: 3800, tokens: 140000, sessions: 950 },
  { name: "May", messages: 5000, tokens: 200000, sessions: 1350 },
  { name: "Jun", messages: 4300, tokens: 165000, sessions: 1080 },
  { name: "Jul", messages: 6200, tokens: 240000, sessions: 1550 },
];

const peakTimeData = [
  { time: "8:00 AM - 10:00 AM", percentage: 45 },
  { time: "10:00 AM - 12:00 PM", percentage: 75 },
  { time: "12:00 PM - 2:00 PM", percentage: 60 },
  { time: "2:00 PM - 4:00 PM", percentage: 65 },
  { time: "4:00 PM - 6:00 PM", percentage: 55 },
  { time: "6:00 PM - 8:00 PM", percentage: 85 },
  { time: "8:00 PM - 10:00 PM", percentage: 70 },
];

const recentChats = [
  {
    id: 1,
    sessionId: "SESSION_123456",
    message: "I need help with my order",
    time: "2 hours ago",
    platform: "website",
    lastMessage: "Let me check that order status for you right away",
    statusOrIntent: "Order Status",
    chatbotName: "Support Bot",
    email: "customer@example.com",
    phone: "+1 (555) 123-4567",
  },
  {
    id: 2,
    sessionId: "SESSION_789012",
    message: "When will my order be shipped?",
    time: "3 hours ago",
    platform: "facebook",
    lastMessage: "Your order will ship within 24-48 hours",
    statusOrIntent: "Shipping Inquiry",
    chatbotName: "Sales Bot",
    email: "johndoe@example.com",
    phone: "+1 (555) 987-6543",
  },
  {
    id: 3,
    sessionId: "SESSION_345678",
    message: "Do you have this in blue?",
    time: "5 hours ago",
    platform: "whatsapp",
    lastMessage:
      "Yes, we have this product available in blue. Would you like to see a photo?",
    statusOrIntent: "Product Question",
    chatbotName: "Product Bot",
    email: null,
    phone: null,
  },
  {
    id: 4,
    sessionId: "SESSION_901234",
    message: "Can I get a refund?",
    time: "6 hours ago",
    platform: "instagram",
    lastMessage:
      "I understand you want a refund. Let me get that process started for you.",
    statusOrIntent: "Refund Request",
    chatbotName: "Support Bot",
    email: "refund@example.com",
    phone: "+1 (555) 456-7890",
  },
  {
    id: 5,
    sessionId: "SESSION_567890",
    message: "What are your store hours?",
    time: "8 hours ago",
    platform: "website",
    lastMessage:
      "Our store is open Monday-Friday 9AM-8PM, Saturday 10AM-6PM, and Sunday 12PM-5PM.",
    statusOrIntent: "General Question",
    chatbotName: "Info Bot",
    email: "shopper@example.com",
    phone: null,
  },
];

const tooltips = (activeMetric) => {
  return {
    totalChats:
      "Total number of chat conversations handled by your AI chatbots across all platforms.",
    totalLeads:
      "Number of potential customers identified through chat interactions based on qualifying criteria.",
    tokensUsed:
      "Total number of tokens consumed by your AI models during conversations. Each token is roughly 4 characters of text.",
    remainingTokens:
      "Number of tokens remaining in your current subscription plan.",
    messageActivity:
      activeMetric === "messages"
        ? "Graph showing message volume trends over time, helping identify peak usage periods and trends."
        : activeMetric === "tokens"
        ? "Graph showing token consumption over time, helping track your AI usage and costs."
        : "Graph showing user session trends over time, tracking unique conversation instances.",
    peakTimes:
      "Time periods with the highest chat activity, calculated based on message volume.",
    uniqueVisitors:
      "Count of distinct users who have initiated chat conversations with your chatbots.",
  };
};

export { data, peakTimeData, recentChats, tooltips };
