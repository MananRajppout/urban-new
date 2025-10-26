import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

const UpdateAgentWelcomeMessage = ({ welcome_message_text, handleWelcomeMessageChange, voice_mail_response, handleVoiceMailResponseChange }) => {
  const inputRef = useRef(null);
  const inputRef2 = useRef(null);
  const addToken = (token) => {
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const before = welcome_message_text.new.substring(0, start);
    const after = welcome_message_text.new.substring(end);
    const newPrompt = `${before} ${token} ${after}`;

    handleWelcomeMessageChange(newPrompt);

    // Set cursor after inserted token
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = start + token.length + 2;
      input.focus();
    }, 0);
  };

  const addToken2 = (token) => {
    const input = inputRef2.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const before = voice_mail_response.new.substring(0, start);
    const after = voice_mail_response.new.substring(end);
    const newVoiceMailResponse = `${before} ${token} ${after}`;

    handleVoiceMailResponseChange(newVoiceMailResponse);

    setTimeout(() => {
      input.selectionStart = input.selectionEnd = start + token.length + 2;
      input.focus();
    }, 0);
  };
  return (
    <>
    
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Welcome Message
      </label>
      <input
        value={welcome_message_text.new}
        ref={inputRef}
        onChange={(e) => handleWelcomeMessageChange(e.target.value)}
        placeholder="Provide You Agent Welcome Message."
        className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-sm text-white focus:border-accent-teal focus:outline-none resize-none"
      />
      <p className="text-xs text-gray-400 mt-2">
        This welcome message is spoken first by your agent.
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

    </div>

    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Voice Mail Response
      </label>
      <input
        value={voice_mail_response.new}
        ref={inputRef2}
        onChange={(e) => handleVoiceMailResponseChange(e.target.value)}
        placeholder="Provide You Agent Welcome Message."
        className="glass-panel border border-subtle-border rounded-md px-4 py-2 w-full text-sm text-white focus:border-accent-teal focus:outline-none resize-none"
      />
      <p className="text-xs text-gray-400 mt-2">
        This voice mail response is spoken when the voice mail is detected.
      </p>

      <div>
        <Button className="border-none mx-1" onClick={() => addToken2("{{customer_name}}")}>
          Customer Name
        </Button>
        <Button className="border-none mx-1" onClick={() => addToken2("{{context}}")}>
          Context
        </Button>
        <Button className="border-none mx-1" onClick={() => addToken2("{{phone_number}}")}>
          Phone
        </Button>
      </div>

    </div>
    </>
  );
};

export default UpdateAgentWelcomeMessage;
