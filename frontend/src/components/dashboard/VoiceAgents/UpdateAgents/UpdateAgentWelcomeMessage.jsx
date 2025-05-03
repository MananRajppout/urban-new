import React from "react";

const UpdateAgentWelcomeMessage = ({ welcome_message_text,handleWelcomeMessageChange }) => {
  
  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Welcome Message
      </label>
      <input
        value={welcome_message_text.new}
        onChange={(e) => handleWelcomeMessageChange(e.target.value)}
        placeholder="Provide You Agent Welcome Message."
        className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-sm text-white focus:border-accent-teal focus:outline-none resize-none"
      />
      <p className="text-xs text-gray-400 mt-2">
        This welcome message is spoken first by your agent.
      </p>
      
    </div>
  );
};

export default UpdateAgentWelcomeMessage;
