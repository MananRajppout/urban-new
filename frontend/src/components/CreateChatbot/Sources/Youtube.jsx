import { isValidURL } from "@/Utils";
import { fetchYoutube, verifyLink } from "@/lib/api/ApiCreateChatbot";
import { deleteChatSource } from "@/lib/api/ApiUpdateChatbot";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import deleteLogo from "../../../assets/Icons/delete.svg";

// {
//   "success": true,
//   "message": "Youtube transcript found !",
//   "file_name": "/tmp/training_data_20240329T102714273Z.txt",
//   "text_length": 62274,
//   "url": "https://www.youtube.com/watch?v=idtZ_DsPWT8"
// }

export default function Youtube({ youtube, setYoutube, setIsBusy, count }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const linkInput = useRef();
  const { id } = router.query;

  async function onVerify(url) {
    
    if (isProcessing) {
      toast.error("Please wait for the progress to be getting completed");
      return;
    }

    if (isValidURL(url) == false) {
      toast.error("Url is not valid!");
      return;
    }


    if (url == "") {
      toast.error("url should not be empty!");
      return;
    }

    setIsBusy(true);
    setIsProcessing(true);

    const res = await fetchYoutube(url, id);
    if (res.data) {
      setYoutube((old) => {
        const temp = structuredClone(old);
        temp.isChanged = true;
        temp.data = [
          ...temp.data,
          {
            url: url,
            file_name: res.data.file_name,
            text_length: res.data.text_length,
          },
        ];
        return temp;
      });
    } else {
      toast.error(res.message);
    }
    console.log(res);

    setIsBusy(false);
    setIsProcessing(false);
  }

  async function onLinkRemove(linkIndex) {
    const removeLink = structuredClone(youtube.data[linkIndex]);

    setYoutube((old) => {
      const clone = structuredClone(old);
      clone.isChanged = true;
      const arr = clone.data.slice().filter((_, index) => index != linkIndex);
      clone.data = arr;
      return clone;
    });

    if (removeLink.id) {
      const res = await deleteChatSource(id, removeLink.id);
      if (res.data) {
        toast.success("Link removed successfully");
      } else {
        toast.error("Failed to remove link");

        setYoutube((old) => {
          const clone = structuredClone(old);
          clone.isChanged = true;
          clone.data.push(removeLink);
          return clone;
        });
      }
    }
  }

  return (
    <>
      <h3>Youtube Link</h3>
      <div className="link-container">
        <input ref={linkInput} type="url" />

        <button
          onClick={(e) => onVerify(e.target.previousSibling.value)}
          className="hover"
        >
          {isProcessing == true ? (
            <span className="loading dark small"></span>
          ) : (
            "Fetch Link"
          )}
        </button>

        {/* {linkProgress > 0 && (
          <div className="link-progress">
            <span>{getProgress(linkProgress)}%</span>
            <div className="progress-container">
              <div style={{ width: getProgress(linkProgress) + "%" }}></div>
            </div>
          </div>
        )} */}
      </div>
      <div className="clean-all">
        <p className="note">
          This will crawl all the links starting with the URL (not including
          files on the website).
        </p>
        {/* <button className="hover primary">Add Link</button> */}
      </div>

      <h3>Included Links</h3>
      <div className="included-links">
        {youtube.data.map((value, index) => (
          <div key={index}>
            <span className="url">{value.url}</span>
            <span>{value.text_length}</span>
            <img
              className="hover"
              onClick={() => onLinkRemove(index)}
              src={deleteLogo.src}
            />
          </div>
        ))}
      </div>
    </>
  );
}
