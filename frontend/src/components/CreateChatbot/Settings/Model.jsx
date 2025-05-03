import React, { useContext, useEffect, useRef, useState } from "react";

import eatImg from "../../../assets/eat.png";
import chatIcon from "../../../assets/Icons/chat.svg";
import Dropdown from "../../Widget/Dropdown";
import Slider from "../../Widget/Slider";
import { ServerDataContext } from "../../../pages/my-chatbot/update/[id]";
import { updateChatbotById } from "../../../lib/api/ApiUpdateChatbot";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import useAutosizeTextArea from "@/hooks/useAutoSizeTextarea";

const items = [
  {
    name: "GPT 3.5 Turbo",
    value: "gpt-3.5-turbo",
  },
  {
    name: "GPT 4o",
    value: "gpt-4o",
  },
  {
    name: "GPT 4",
    value: "gpt-4",
  },
  {
    name: "GPT 4 Turbo",
    value: "gpt-4-0125-preview",
  },
  {
    name: "Gemini 1 Pro",
    value: "gemini-1.0-pro",
  },
  {
    name: "Gemini 1.5 Flash",
    value: "gemini-1.5-flash",
  },
  {
    name: "Gemini 1.5 Pro",
    value: "gemini-1.5-pro",
  },
  {
    name: "Urbanchat Z1",
    value: "urbanchat-z1"

  },

];

export default function Model() {
  const { serverData, setServerData, userDetail } =
    useContext(ServerDataContext);
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const [isBasicPlan, setIsBasicPlan] = useState(false);

  const formData = useRef({
    base_prompt: "",
    temperature: 0,
    chatgpt_model_type: "",
  });

  useEffect(() => {
    const plan = userDetail.data.current_plan.name;
    if (plan == "Free" || plan == "Hobby") {
      setIsBasicPlan(true);
    }
  }, [userDetail]);

  function onModelSelect(value) {
    formData.current.chatgpt_model_type = value;
  }

  useEffect(() => {
    setProgress(serverData.chatbot_model.temperature * 100);
  }, []);

  async function onSave() {
    if (isSaving) return;
    const data = structuredClone(formData.current);

    // filter
    if (data.base_prompt == serverData.chatbot_model.base_prompt)
      delete data.base_prompt;
    if (data.chatgpt_model_type == serverData.chatbot_model.chatgpt_model_type)
      delete data.chatgpt_model_type;
    if (data.temperature == serverData.chatbot_model.temperature)
      delete data.temperature;

    // do more ...

    if (Object.keys(data).length == 0) {
      toast.error("Please update something first");
      return;
    }

    setIsSaving(true);
    const res = await updateChatbotById(id, data);
    if (res.data) {
      toast.success("Updated successfully");
      setServerData((old) => {
        const raw = structuredClone(old);
        if (data.base_prompt) raw.chatbot_model.base_prompt = data.base_prompt;
        if (data.chatgpt_model_type)
          raw.chatbot_model.chatgpt_model_type = data.chatgpt_model_type;
        if (data.temperature) raw.chatbot_model.temperature = data.temperature;

        return raw;
      });

      nextTab();
    } else {
      toast.error(res.message);
    }

    setIsSaving(false);
  }

  useEffect(() => {
    // set state
    formData.current.base_prompt = serverData.chatbot_model.base_prompt;
    formData.current.chatgpt_model_type =
      serverData.chatbot_model.chatgpt_model_type;
    formData.current.temperature = serverData.chatbot_model.temperature;
  }, []);

  function nextTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=security`);
  }

  function previousTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=chat-interface`);
  }

  const textAreaRef1 = useRef(null);
  const [textValue1, setTextValue1] = useState("");
  useAutosizeTextArea(textAreaRef1.current, textValue1);

  return (
    <div>
      <div>
        <h2>Model</h2>

        <p className="input-title">Base Prompt (system message)</p>
        <textarea
          ref={textAreaRef1}
          onChange={(e) => {
            const temp = e.target.value;
            if (!temp) return;
            formData.current.base_prompt = temp;
            setTextValue1(temp);
          }}
          defaultValue={serverData.chatbot_model.base_prompt}
          placeholder="Enter message"
          style={{ minHeight: 200 }}
        ></textarea>
        <div className="clean-all">
          {/* <p className="note">Enter each message in a new line.</p> */}
          {/* <button onClick={(e) => alert(e.target.parent.previousSibling.value)}>
            Clean All
          </button> */}
        </div>

        <p className="input-title">Chatbot Model</p>
        <div style={{ maxWidth: 600 }}>
          <Dropdown
            items={items}
            currentValue={serverData.chatbot_model.chatgpt_model_type}
            onSelect={onModelSelect}
            disabledItems={isBasicPlan ? ["gpt-4", "gpt-4-0125-preview"] : []}
          />
          <div className="note-box">
            <span>Note</span>
            <p>gpt-4o is the most advanced OpenAI model available.</p>
          </div>
        </div>

        <div style={{ maxWidth: 600 }}>
          <div className="temperature">
            <p className="input-title">Temperature</p>
            <span>{progress}%</span>
          </div>
          <Slider
            texts={["Reserved", "Creative"]}
            value={progress}
            onProgress={(e) => {
              const temp = parseInt(e);
              formData.current.temperature = temp / 100;
              setProgress(temp);
            }}
          />
        </div>

        <div className="button-holder">
          <button className="secondary" onClick={previousTab}>
            Previous
          </button>
          <button onClick={onSave} className="primary">
            {isSaving ? <span className="loading small"></span> : "Save & Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
