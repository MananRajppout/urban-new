import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  createChatSourceByLink,
  createChatbot,
  verifyLink,
} from "../../../lib/api/ApiCreateChatbot";
import { isValidURL } from "../../../Utils";
import deleteLogo from "../../../assets/Icons/delete.svg";

import {
  deleteAllWebsiteLinks,
  deleteChatSource,
} from "../../../lib/api/ApiUpdateChatbot";
import { useRouter } from "next/router";

export default function WebsiteLink({
  websiteLink,
  setWebsiteLink,
  count,
  setIsBusy,
}) {

  const limit = 4_00_000;
  const router = useRouter();
  const { id } = router.query;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSitemapProcessing, setIsSitemapProcessing] = useState(false);

  const sitemapInput = useRef();
  const linkInput = useRef();

  // const sitemapInput = useRef();
  // const linkInput = useRef();

  const [linkProgress, setLinkProgress] = useState(0);
  const [sitemapLinkProgress, setSitemapLinkProgress] = useState(0);
  const timerId = useRef({
    linkId: "",
    sitemapId: "",
  });

  useEffect(() => {
    console.log(websiteLink.data);
  }, []);

  const endTime = 210;
  // progress time = 210 seconds | 3.5 min
  function startTimer(isSitemap = false) {
    timerId.current.linkId = setInterval(() => {
      if (isSitemap) {
        setSitemapLinkProgress((old) => {
          // let progress = Math.round(old + 2)    // 200 seconds
          let progress = old + 1;
          if (progress > endTime) {
            progress = endTime;
            clearInterval(timerId.current.sitemapId);
          }
          return progress;
        });
      } else {
        setLinkProgress((old) => {
          // let progress = Math.round(old + 2) // 200 seconds
          let progress = old + 1;
          if (progress > endTime) {
            progress = endTime;
            clearInterval(timerId.current.linkId);
          }
          return progress;
        });
      }
    }, 1000);
  }

  function stopTimer(isSitemap = false) {
    if (isSitemap) {
      clearInterval(timerId.current.sitemapId);
    } else {
      clearInterval(timerId.current.linkId);
    }

    setIsBusy(false);
  }

  // function sanitizeUrl(url) {
  //   if (!/^https?:\/\//i.test(url)) {
  //     return `https://${url}`;
  //   }
  //   return url;
  // }

  async function onVerify(url, isSitemap = false) {
    if (isProcessing || isSitemapProcessing) {
      toast.error("Please wait for the progress to be getting completed");
      return;
    }

    // url = sanitizeUrl(url);

    if (isValidURL(url) == false) {
      toast.error("Url is not valid!");
      return;
    }

    // if (count > limit) {
    //   toast.error("Limit reached out");
    //   return;
    // }

    if (url == "") {
      toast.error("url should not be empty!");
      return;
    }

    setIsBusy(true);

    if (isSitemap) {
      setIsSitemapProcessing(true);
      setSitemapLinkProgress(0);
      startTimer(true);
    } else {
      setIsProcessing(true);
      setLinkProgress(0);
      startTimer();
    }

    const res = await verifyLink(url, isSitemap);

    // console.log(res);
    if (res.data && res.data.response) {
      let tempCount = count;
      let tempData = [];
      for (const item of res.data.response) {
        tempCount += item.text_length;
        tempData.push({
          url: item.url,
          file_name: item.file_name,
          text_length: item.text_length,
          id: null,
        });
      }

      // merge the data to array

      if (tempData.length > 0) {
        setWebsiteLink((old) => {
          const clone = structuredClone(old);
          clone.isChanged = true;
          clone.data = [...clone.data, ...tempData];
          return clone;
        });

        if (isSitemap) {
          setSitemapLinkProgress(endTime);
        } else {
          setLinkProgress(endTime);
        }
      }
    } else {
      toast.error(res.message);
    }

    if (isSitemap) {
      stopTimer(true);
      setIsSitemapProcessing(false);
    } else {
      stopTimer(false);
      setIsProcessing(false);
    }
  }

  const [isDeleting, setIsDeleting] = useState(false);

  async function onDeleteAllLinks() {
    if (isDeleting) return;
    setIsDeleting(true);

    const res = await deleteAllWebsiteLinks(id);
    setIsDeleting(false);
    if (!res.data) {
      toast.error(res.message);
    } else {
      setWebsiteLink((old) => {
        const clone = structuredClone(old);
        clone.isChanged = true;
        clone.data = [];
        return clone;
      });

      toast.success("All links removed successfully");
    }
  }

  async function onLinkRemove(linkIndex) {
    const removeLink = structuredClone(websiteLink.data[linkIndex]);

    setWebsiteLink((old) => {
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

        setWebsiteLink((old) => {
          const clone = structuredClone(old);
          clone.isChanged = true;
          clone.data.push(removeLink);
          return clone;
        });
      }
    }
  }

  function getProgress(value) {
    return Math.round((value / endTime) * 100);
  }

  // function countCollectionData(data) {
  //   let count = 0
  //   for (const item of data) {
  //     count += item.text_length
  //   }

  //   return count
  // }
  function handleLinkInputChange(e) {
    const url = e.target.value;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      e.target.value = url;
    } else if ("https://".startsWith(url) || "http://".startsWith(url)) {
      e.target.value = url;
    } else {
      e.target.value = `https://${url}`;
    }
  }
  return (
    <>
      <h3>Link</h3>
      <div className="link-container">
        <input placeholder="https://example.com" ref={linkInput} type="url" onChange={handleLinkInputChange} />

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

        {linkProgress > 0 && (
          <div className="link-progress">
            <span>{getProgress(linkProgress)}%</span>
            <div className="progress-container">
              <div style={{ width: getProgress(linkProgress) + "%" }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="clean-all">
        <p className="note">
          This will crawl all the links starting with the URL (not including
          files on the website).
        </p>
        {/* <button className="hover primary">Add Link</button> */}
      </div>
      <br />

      <h3>Submit Sitemap</h3>
      <div className="link-container">
        <input placeholder="https://example.com/sitemap.xml" ref={sitemapInput} type="url" onChange={handleLinkInputChange} />

        <button
          onClick={(e) => onVerify(e.target.previousSibling.value, true)}
          className="hover"
        >
          {isSitemapProcessing == true ? (
            <span className="loading dark small"></span>
          ) : (
            "Fetch Link"
          )}
        </button>

        {sitemapLinkProgress > 0 && (
          <div className="link-progress">
            <span>{getProgress(sitemapLinkProgress)}%</span>
            <div className="progress-container">
              <div
                style={{ width: getProgress(sitemapLinkProgress) + "%" }}
              ></div>
            </div>
          </div>
        )}
        {/* <button
            onClick={(e) => onVerify(e.target.previousSibling.value, true)}
            className="hover"
          >
            {isSitemapProcessing == true ? (
              <span className="loading dark small"></span>
            ) : (
              "Verify Link"
            )}
          </button> */}
      </div>
      <div className="clean-all">
        <p className="note">
          This will crawl all the links starting with the URL (not including
          files on the website).
        </p>
        {/* <button className="hover primary">Add Link</button> */}
      </div>

      <div className="included-links-header">
        <h3>Included Links</h3>
        {websiteLink.data.length > 0 && (
          <button onClick={onDeleteAllLinks} className="outline danger hover">
            {isDeleting && <span className="loading mini danger"></span>} Delete
            all
          </button>
        )}
      </div>
      <div className="included-links thin">
        {websiteLink.data.map((value, index) => (
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
