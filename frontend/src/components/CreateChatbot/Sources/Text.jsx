import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  createChatSourceByText,
  createChatbot,
} from "../../../lib/api/ApiCreateChatbot";
import {
  fetchChatbotSource,
  updateChatSource,
} from "../../../lib/api/ApiUpdateChatbot";


export default function Text({ text, setText, count }) {

  // useEffect(() => {
  //   if (textList.length > 0) {
  //     loadDefault(textList[0].id, textList[0].sourceId);
  //   } else {
  //     setIsLoaded(true);
  //   }
  // }, []);

  // async function loadDefault(id, sourceId) {
  //   const res = await fetchChatbotSource(id, "source", sourceId);

  //   if (res.data) {
  //     if (res.data.chatbot_source.length > 0) {
  //       setServerData(res.data.chatbot_source[0]);
  //       setText(res.data.chatbot_source[0].source_data);
  //       setCount(res.data.chatbot_source[0].source_data.length);
  //     } else {
  //       toast.error("No default data exist");
  //     }
  //   } else {
  //     toast.error(res.data);
  //   }

  //   setIsLoaded(true);
  // }

  async function onSubmit() {
    // if (isProcessing) return;
    // if (text.length == 0) {
    //   toast("Please write something first!", {
    //     icon: "⚠",
    //   });
    //   return;
    // }

    // // get chatbot id
    // setIsProcessing(true);

    // if (isEditMode) {
    //   if (serverData) {
    //     const res = await updateChatSource(
    //       serverData.chat_model_id,
    //       serverData.chat_bot_source_detail_id,
    //       text,
    //       "text"
    //     );
    //     if (res.data) {
    //       toast.success("Successfully updated");
    //     } else {
    //       toast.error(res.message);
    //     }
    //   } else {
    //     await createChatSource(id);
    //   }
    // } else {
    //   if (!chatbotId) {
    //     setIsProcessing(false);
    //     return;
    //   }

    //   await createChatSource(chatbotId);
    // }

    // setIsProcessing(false);
  }

  // async function createChatSource(chatbotId) {
  //   // sending data to server
  //   const res = await createChatSourceByText(chatbotId, text);
  //   if (res.data) {
  //     toast.success("Chatbot created successfully");
  //     history.push("/my-chatbot/update/" + chatbotId)
  //   } else {
  //     toast.error(res.message);
  //   }
  // }

  // function onTyping(value) {
  //   setText(value);
  // }

  // useEffect(() => {
  //   if (isClear == false) return;
  //   // setQuestions([""]);
  //   // setAnswers([""]);
  //   setText("");

  //   setIsClear(false);
  // }, [isClear]);

  return (
    <textarea
      value={text.text}
      onChange={(e) => {

        const value = e.target.value
        const currentLimit = count - text.text.length + value.length
        // if(currentLimit > 400_000){
        //   toast.error("Character limit reached")
        //   return
        // }
        
        setText((old) => {
          const temp = structuredClone(old)
          temp.isChanged = true
          temp.text = value
          return temp
        })
      }}
      maxLength={400_000}
      // onChange={(e) => onTyping(e.target.value)}
      className="hide-border thin"
      rows={12}
      placeholder="Write here something..."
    ></textarea>
  );
}
