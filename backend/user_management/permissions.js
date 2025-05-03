// permissions.js

// Define chatbot access for different roles
const chatbotAccessDefinition = {
  1: [
    "chatbot:write",
    "chatbot:read",
    "chatbot:export",
    "chatbot:delete",
    "user:invite",
    "user:edit",
    "pricing:read",
  ],
  2: ["chatbot:write", "chatbot:read", "chatbot:export", "user:invite"],
  3: ["chatbot:read", "chatbot:export"],
  4: ["chatbot:read"],
};

// Export the function to get access by role ID
const getChatbotAccessByRoleID = (roleId) => {
  if (!chatbotAccessDefinition[roleId]) {
    throw new Error(`Invalid role ID: ${roleId}`);
  }
  return chatbotAccessDefinition[roleId];
};

module.exports = {
  getChatbotAccessByRoleID,
};
