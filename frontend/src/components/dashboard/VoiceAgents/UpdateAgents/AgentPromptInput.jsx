import { Button } from "@/components/ui/button";
import React, { useRef } from "react";

const AgentPromptInput = ({ prompt, setPrompt }) => {
  const textareaRef = useRef(null);

  const addToken = (token) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = prompt.substring(0, start);
    const after = prompt.substring(end);
    const newPrompt = `${before} ${token} ${after}`;

    setPrompt(newPrompt);

    // Set cursor after inserted token
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + token.length+2;
      textarea.focus();
    }, 0);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Base Prompt
      </label>
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Provide a base prompt for your AI agent..."
        className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full h-80 text-sm text-white focus:border-accent-teal focus:outline-none resize-none"
      />
      <p className="text-xs text-gray-400 mt-1">
        This prompt defines your agent&apos;s behavior and capabilities.
      </p>

      <p className="text-sm text-gray-400 mt-4">
        Avaible Variable:
      </p>
      <div>
        <Button className="border-none mx-1" onClick={() => addToken("{{customer_name}}")}>
          Customer Name
        </Button>
        <Button className="border-none mx-1" onClick={() => addToken("{{context}}")}>
          Context
        </Button>
        <Button className="border-none mx-1" onClick={() => addToken("{{phone_number}}")}>
          Phone
        </Button>
      </div>

      <p className="text-sm  mt-4 bg-blue-900/20 p-2 rounded text-blue-300">
        <strong>Note:</strong> {"Variables like {customer_name}, {context}, and {phone_number} can be used in your base prompt for outbound calls, especially when using Google Sheets for bulk calling. These variables will be automatically replaced with actual data from your Google Sheet or single outbound call details"}
      </p>


    </div>
  );
};

export default AgentPromptInput;