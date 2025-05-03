import React, { useContext, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";
import {
  updateChatbotById,
  verifyFacebook,
} from "../../lib/api/ApiUpdateChatbot";
import { useRouter } from "next/router";
import Link from "next/link";

import shopifyImg from "@/assets/shopify_pic.png";
import { ServerDataContext } from "@/pages/my-chatbot/update/[id]";
import { isValidURL } from "@/Utils";

export default function ShopifyDialog({ isOpen, onDialogClose }) {
  const router = useRouter();
  const { id } = router.query;
  const [url, setUrl] = useState("");
  const { serverData, setServerData } = useContext(ServerDataContext);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (serverData) {
      setUrl(serverData.view[0].shopify_store_url);
    }
  }, [serverData]);

  async function save() {
    let _url = url;
    if (!isValidURL(_url) && _url !== "") {
      toast.error("Invalid URL");
      return;
    }

    let urlObj = null;
    try {
      if (!_url.startsWith("http") && !_url.startsWith("https"))
        _url = "https://" + _url;

      urlObj = new URL(_url);
    } catch (error) {
      toast.error("Invalid URL");
      return;
    }

    setUrl(urlObj.host);

    const data = {
      shopify_store_url: urlObj.host,
    };
    if (isSaving) return;
    setIsSaving(true);
    const res = await updateChatbotById(id, data);
    setIsSaving(false);
    if (res.data) {
      setServerData((old) => {
        const clone = structuredClone(old);
        clone.view[0].shopify_store_url = url;
        return clone;
      });
      toast.success("Shopify URL updated successfully");
      onDialogClose();
    } else {
      toast.error(res.message);
    }
  }

  function close(className) {
    if (isSaving) return;

    if (className == "dialog-outer") {
      onDialogClose();
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="dialog-outer"
          onClick={(e) => close(e.target.className)}
        >
          <div className="dialog shopify">
            <div className="layer">
              <img src={shopifyImg.src} alt="shopify" />
            </div>

            {/* TODO hide for now */}

            <div className="input-container">
              <p className="heading">Shopify URL</p>
              <div className="grid-auto-max">
                <div className="input-container">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your_shop_name.myshopify.com"
                    style={{ width: "100%" }}
                    className="text-field"
                  />
                </div>
                <button onClick={save} className="primary hover">
                  {isSaving ? <span className="loading mini"></span> : "Save"}
                </button>
              </div>
            </div>
            <br />
            <br />
            <p className="note center">
              To integrate chatbot manually{" "}
              <Link href="/integration/shopify">click here</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
