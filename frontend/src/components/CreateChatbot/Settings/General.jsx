import React, { useContext, useRef, useState } from "react";
import { ServerDataContext } from "../../../pages/my-chatbot/update/[id]";
import { updateChatbotById } from "../../../lib/api/ApiUpdateChatbot";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function General() {
  const { serverData, setServerData } = useContext(ServerDataContext);
  const router = useRouter();
  const { id } = router.query;
  const name = useRef();
  const [isSaving, setIsSaving] = useState(false);

  async function onSave() {
    if (name.current.value == serverData.view[0].bot_title) {
      toast.error("Please update something first");
      return;
    }

    setIsSaving(true);
    const res = await updateChatbotById(id, { bot_title: name.current.value });
    if (res.data) {
      toast.success("Updated successfully");
      setServerData((old) => {
        const raw = structuredClone(old);
        raw.view[0].bot_title = name.current.value;

        return raw;
      });

      nextTab();
    } else {
      toast.error(res.message);
    }

    setIsSaving(false);
  }

  function nextTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=notifications`);
  }

  function previousTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=leads`);
  }

  return (
    <div>
      <div>
        <div className="col-2" style={{ gap: 60 }}>
          <div>
            <h2>General</h2>

            <p className="input-title">Chatbot Id</p>
            <input type="text" disabled defaultValue={id} />

            <p className="input-title">Chatbot Name</p>
            <input
              ref={name}
              type="text"
              placeholder="title"
              defaultValue={serverData.view[0].bot_title}
            />

            <p className="input-title">Last trained at</p>
            <input
              type="text"
              disabled
              defaultValue={serverData.view[0].last_trained}
            />
          </div>
        </div>

        <div className="button-holder">
          <button className="secondary" onClick={previousTab}>
            Previous
          </button>
          <button className="primary" onClick={() => onSave()}>
            {isSaving ? <span className="loading mini"></span> : "Save & Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
