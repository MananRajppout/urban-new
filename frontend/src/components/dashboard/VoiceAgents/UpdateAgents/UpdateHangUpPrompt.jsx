import React from "react";

const UpdateHangUpPrompt = ({ hang_up_promt, handleHangUpPromptChange }) => {
  return (
    <div className="mt-8">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Hang Up Call Prompt
      </label>
      <textarea
        value={hang_up_promt.new}
        onChange={(e) => handleHangUpPromptChange(e.target.value)}
        placeholder="Provide You Agent Hang Up Call Promt"
        className="glass-panel border h-28 border-subtle-border rounded-md px-4 py-2 w-full text-sm text-white focus:border-accent-teal focus:outline-none resize-none"
      />
      <p className="text-xs text-gray-400 mt-2">
        This prompt provides instructions to the agent on when it should end the call. You can describe specific situations or phrases that indicate the call is over.
      </p>
    </div>
  );
};

export default UpdateHangUpPrompt;
