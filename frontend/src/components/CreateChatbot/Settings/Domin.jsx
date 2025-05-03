import React, { useContext, useEffect, useRef, useState } from "react";
import {
  updateChatbotById,
  verifyDomainLink,
} from "../../../lib/api/ApiUpdateChatbot";
import toast from "react-hot-toast";
import { ServerDataContext } from "../../../pages/my-chatbot/update/[id]";
import { isValidURL } from "../../../Utils";
import { useRouter } from "next/router";

export default function Domain() {
  const { serverData, setServerData } = useContext(ServerDataContext);
  const [isSaving, setIsSaving] = useState(false);
  const [domains, setDomains] = useState([{ url: "", verified: false }]);

  const isVerifying = useRef(false);

  const router = useRouter();
  const { id } = router.query;

  //domains

  async function verifyDomain(url) {
    if (isVerifying.current) {
      toast.error("Already verifying, please wait");
      return;
    }

    if (isValidURL(url) == false) {
      toast.error("Url is not in valid structure!");
      return;
    }

    const index = domains.findIndex((item) => item.url == url);

    if (index == -1) {
      toast.error("Unable to verify domain");
      return;
    }

    isVerifying.current = true;
    toast.success("Processing, please wait");
    const isVerified = await verifyDomainLink(url); // true | false

    if (isVerified) {
      setDomains((old) => {
        const temp = [...old];
        temp[index].verified = true;
        return temp;
      });
      toast.success("Your link verified successfully");
    } else {
      toast.error("Unable to verify you link");
    }

    isVerifying.current = false;
  }

  async function onSave() {
    const data = JSON.stringify([...domains].filter((item) => item.url != ""));

    const unverified = domains.findIndex((item) => item.verified == false);
    if (unverified != -1) {
      toast.error("Verify links first");
      setDomains((old) => [...old].filter((item) => item.url != ""));
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    const res = await updateChatbotById(id, { allowed_domains: data });
    if (res.data) {
      toast.success("Updated successfully");
      setServerData((old) => {
        const raw = structuredClone(old);
        raw.view[0].allowed_domains = data;
        return raw;
      });

      nextTab();
    } else {
      toast.error(res.message);
    }

    setIsSaving(false);

    setDomains((old) => [...old].filter((item) => item.url != ""));
  }

  useEffect(() => {
    try {
      //new data structure
      const domains = JSON.parse(serverData.view[0].allowed_domains);
      setDomains(domains);
    } catch (error) {
      // old structure
      const domains = serverData.view[0].allowed_domains
        .split(",")
        .map((item) => {
          return { url: item, verified: false };
        });
      setDomains(domains);
    }
  }, []);

  function nextTab() {
    router.push(`/my-chatbot/update/${id}?tab=dashboard`);
  }

  function previousTab() {
    router.push(`/my-chatbot/update/${id}?tab=settings&sub_tab=notifications`);
  }

  return (
    <div>
      <div>
        <h2>Domain</h2>
        <div className="note-box">
          <span>Note</span>
          <p>
            Enter the domain you want to allow to use your chatbot, leaving as
            empty allow from all domain.
          </p>
        </div>

        {domains.map((domain, index) => (
          <div key={index} className="link-container">
            <input
              type="text"
              value={domain.url}
              onChange={(e) => {
                const updatedDomains = [...domains];
                updatedDomains[index].url = e.target.value;
                updatedDomains[index].verified = false;
                setDomains(updatedDomains);
              }}
            />

            {domain.verified ? (
              <button className={"hover success"}>Verified</button>
            ) : (
              <button
                className={"hover"}
                onClick={() => verifyDomain(domain.url)}
              >
                Verify Link
              </button>
            )}
          </div>
        ))}

        <div className="clean-all">
          <span></span>
          <button
            className="hover primary"
            onClick={() =>
              setDomains((old) => [...old, { url: "", verified: false }])
            }
          >
            Add Link
          </button>
        </div>

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
