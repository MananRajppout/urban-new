import React, { useContext, useEffect, useRef, useState } from "react";

import Dropdown from "../../Widget/Dropdown";
import Progress from "../../Widget/Slider";
import Toggle from "../../Widget/Toggle";
import ChangeableInput from "../../Widget/ChangeableInput";
import { ServerDataContext } from "../../../pages/my-chatbot/update/[id]";
import toast from "react-hot-toast";
import { updateChatbotById } from "../../../lib/api/ApiUpdateChatbot";
import { useRouter } from "next/router";

const visibility = [
  {
    name: "Public",
    value: "public",
  },
  {
    name: "Private",
    value: "private",
  },
];

// restiction_over_time_to_sent_msg  limit_per_user_msgs
export default function Security() {
  const { serverData, setServerData } = useContext(ServerDataContext);
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const formData = useRef({
    restiction_over_time_to_sent_msg: 0,
    limit_per_user_msgs: 0,
    msg_after_user_msg_limit_reached: "",
    is_active: true,
  });

  async function onSave() {
    if (isSaving) return;
    const data = structuredClone(formData.current);

    // filter
    if (
      data.restiction_over_time_to_sent_msg ==
      serverData.view[0].restiction_over_time_to_sent_msg
    )
      delete data.restiction_over_time_to_sent_msg;

    if (data.limit_per_user_msgs == serverData.view[0].limit_per_user_msgs)
      delete data.limit_per_user_msgs;

    if (
      data.msg_after_user_msg_limit_reached ==
      serverData.view[0].msg_after_user_msg_limit_reached
    )
      delete data.msg_after_user_msg_limit_reached;

    if (data.is_active == serverData.view[0].is_active) delete data.is_active;

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
        if (data.restiction_over_time_to_sent_msg)
          raw.view[0].restiction_over_time_to_sent_msg =
            data.restiction_over_time_to_sent_msg;
        if (data.limit_per_user_msgs)
          raw.view[0].limit_per_user_msgs = data.limit_per_user_msgs;

        if (data.msg_after_user_msg_limit_reached) {
          raw.view[0].msg_after_user_msg_limit_reached =
            data.msg_after_user_msg_limit_reached;
        }

        if (data.is_active != undefined) {
          raw.view[0].is_active = data.is_active;
        }

        return raw;
      });

      nextTab();
    } else {
      toast.error(res.message);
    }

    setIsSaving(false);
  }

  function onVisibilityChange(value) {
    console.log(value);
    if (value == "public"){
      formData.current.is_active = true;
    }else{
      formData.current.is_active = false;
    }
    
  }

  useEffect(() => {
    // set state
    formData.current.restiction_over_time_to_sent_msg =
      serverData.view[0].restiction_over_time_to_sent_msg;
    formData.current.limit_per_user_msgs =
      serverData.view[0].limit_per_user_msgs;

    formData.current.msg_after_user_msg_limit_reached =
      serverData.view[0].msg_after_user_msg_limit_reached;

    formData.current.is_active = serverData.view[0].is_active;

    // update
    // setTheme(serverData.view[0].bot_theme)
  }, []);

  function nextTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=leads`);
  }

  function previousTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=model`);
  }

  return (
    <div>
      <div>
        <h2>Security</h2>

        <p className="input-title">Visibility</p>
        <div style={{ maxWidth: 600 }}>
          <Dropdown
            items={visibility}
            currentValue={serverData.view[0].is_active? "public" : "private"}
            onSelect={onVisibilityChange}
          />
        </div>
        <br />

        <div
          style={{
            maxWidth: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ marginBottom: 12 }}>Widget</h3>
            <p style={{ marginTop: 12 }} className="input-title">
              Only allow Iframe and on specific domains
            </p>
          </div>
          <Toggle isOn={false} />
        </div>

        <p className="input-title">Rate Limiting</p>
        <div className="note-box">
          <span>Note</span>
          <p>
            Limit the number of messages sent from one device on the iframe and
            chat bubble (this limit will not be applied to you on urbanchat.ai,
            only on your website for your users to prevent abuse). <br />
            Setting value to <b>negative</b> result in no limit.
          </p>
        </div>

        <div className="col-2">
          <ChangeableInput
            label={"Limit to only"}
            onValueChange={(e) => (formData.current.limit_per_user_msgs = e)}
            value={serverData.view[0].limit_per_user_msgs}
          />
          <ChangeableInput
            label={"Messages every"}
            onValueChange={(e) =>
              (formData.current.restiction_over_time_to_sent_msg = e)
            }
            value={serverData.view[0].restiction_over_time_to_sent_msg}
            extension="Sec"
          />
        </div>

        <br />
        <p className="input-title">
          Show this message to show when limit is hit
        </p>
        <input
          defaultValue={serverData.view[0].msg_after_user_msg_limit_reached}
          type="text"
          onChange={(e) => {
            formData.current.msg_after_user_msg_limit_reached = e.target.value;
          }}
          placeholder="Limit reached message"
        />

        {/* <p className="input-title">
          Show this message to show when limit is hit
        </p>
        <div style={{ maxWidth: 600 }}>
          <Dropdown
            items={[
              {
                name: "Private",
                value: "Private",
              },
            ]}
            onSelect={onModelSelect}
          />
        </div> */}

        <div className="button-holder">
          <button className="secondary" onClick={previousTab}>
            Previous
          </button>
          <button onClick={onSave} className="primary">
            {isSaving ? <span className="loading mini"></span> : "Save & Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
