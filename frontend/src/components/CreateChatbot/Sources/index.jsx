import React, { useContext, useEffect, useRef, useState } from "react";

import fileIcon from "../../../assets/Icons/fileIcon.svg";
import textIcon from "../../../assets/Icons/textIcon.svg";
import linkIcon from "../../../assets/Icons/linkIcon.svg";
import helpIcon from "../../../assets/Icons/helpIcon.svg";
import youtubeIcon from "../../../assets/Icons/youtubeIcon.svg";
import logo from "../../../assets/logo.svg";

import "../../../styles/CreateChatbot/common.css";
import "../../../styles/CreateChatbot/extra-tab-common.css";

import Files from "./Files";
import Text from "./Text";
import WebsiteLink from "./WebsiteLink";
import Help from "./Help";
import {
  createChatSourceByFile,
  createChatSourceByLink,
  createChatSourceByQuestion,
  createChatSourceByText,
  createChatSourceByYoutube,
  createChatbot,
} from "../../../lib/api/ApiCreateChatbot";
import {
  fetchChatbotSource,
  updateChatSource,
} from "../../../lib/api/ApiUpdateChatbot";
import { toast } from "react-hot-toast";

import "../../../styles/CreateChatbot/files.css";
import { useRouter } from "next/router";
import { getSubTabName, getSubTabIndex } from "@/Utils";
import Link from "next/link";
import Youtube from "./Youtube";
import LimitReachDialog from "@/components/Dialog/LimitReachDialog";
import { useRole } from "@/hooks/useRole";

const tabContent = [
  {
    icon: fileIcon.src,
    text: "Files",
  },
  {
    icon: textIcon.src,
    text: "Text",
  },
  {
    icon: linkIcon.src,
    text: "Website Link",
  },
  {
    icon: helpIcon.src,
    text: "Q & A",
  },
  {
    icon: youtubeIcon.src,
    text: "Youtube",
  },
];

export default function Sources({ isOutside, userDetail }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isClear, setIsClear] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [limitReachedMsg, setLimitReachedMsg] = useState("");
  const [charLimit, setCharLimit] = useState(400000);

  const [qaData, setQaData] = useState({
    isChanged: false,
    chatModelId: "",
    chatbotSourceDetailId: "",
    questions: [""],
    answers: [""],
  });

  const [text, setText] = useState({
    isChanged: false,
    chatbotId: "",
    chatbotSourceDetailId: "",
    text: "",
  });

  const [files, setFiles] = useState({
    isChanged: false,
    data: [],
  });
  /**
   structure
   name, count, file, id
   */
  const [websiteLink, setWebsiteLink] = useState({
    isChanged: false,
    data: [],
  });

  /*
  website link structure
  {
      url: "",
      file_name: "",
      text_length: "",
      id: null
    }
  */

  const [youtube, setYoutube] = useState({
    isChanged: false,
    data: [],
  });

  /**
   * youtube link structure
   * {
   *  file_name: "",
   *  text_length: "",
   *  url: ""
   * }
   */

  const chatbotId = useRef(null);
  const [isSubmitProcessing, setIsSubmitProcessing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [count, setCount] = useState(0);

  const router = useRouter();
  const { id, tab, sub_tab } = router.query;

  useEffect(() => {
    let char = 400000;
    if (userDetail) {
      console.log({ plan: userDetail.data });
      char = userDetail.data.current_plan.allowed_characters;
    }

    setCharLimit(char);
  }, [userDetail]);

  function onQaAdd() {
    setQaData((old) => {
      const clone = structuredClone(old);
      clone.isChanged = true;
      clone.questions = ["", ...clone.questions];
      clone.answers = ["", ...clone.answers];
      return clone;
    });
  }

  function onQaRemove(index) {
    setQaData((old) => {
      const clone = structuredClone(old);
      clone.isChanged = true;
      clone.questions.splice(index, 1);
      clone.answers.splice(index, 1);
      return clone;
    });
  }

  useEffect(() => {
    if (isOutside) {
      setActiveTab(getSubTabIndex("sources", sub_tab));
    } else {
      setActiveTab(getSubTabIndex(tab, sub_tab));
    }
  }, [sub_tab]);

  function generateSubTabLink(index) {
    return `/my-chatbot/update/${id}?tab=${tab}&sub_tab=${getSubTabName(
      tab,
      index
    )}`;
  }

  function _generateSubTabLink(index) {
    return `/my-chatbot/create/?sub_tab=${getSubTabName("sources", index)}`;
  }

  useEffect(() => {
    loadChatSource();
  }, []);

  useEffect(() => {
    let tempCount = 0;
    tempCount += text.text.length;

    for (const iterator of qaData.answers) {
      tempCount += iterator.length;
    }

    for (const iterator of qaData.questions) {
      tempCount += iterator.length;
    }

    for (const iterator of files.data) {
      tempCount += iterator.count;
    }

    for (const iterator of websiteLink.data) {
      tempCount += iterator.text_length;
    }

    for (const iterator of youtube.data) {
      tempCount += iterator.text_length;
    }

    setCount(tempCount);
  }, [qaData, text, files, websiteLink, youtube]);

  async function getChatbotId() {
    const res = await createChatbot();
    if (res.data) {
      // toast.success('id created')
      return res.data.chatbot_id;
    } else {
      toast.error(res.message);
      return null;
    }
  }

  async function loadChatSource() {
    if (isOutside) {
      setIsLoaded(true);
      return;
    }

    const res = await fetchChatbotSource(id, "detail");
    if (res.data) {
      const tempQaList = [];
      const tempTextList = [];
      const tempUrlList = [];
      const tempFileList = [];
      const tempYoutubeList = [];

      // youtubeTranscript
      res.data.chatbot_sources_details.forEach((element) => {
        if (element.type == "qa") {
          tempQaList.push({
            id: element.chat_model_id,
            count: element.num_of_characters,
            sourceId: element._id,
          });
        } else if (element.type == "text") {
          tempTextList.push({
            id: element.chat_model_id,
            count: element.num_of_characters,
            sourceId: element._id,
          });
        } else if (element.type == "url") {
          const tempData = {
            url: element.url,
            file_name: "",
            text_length: element.num_of_characters,
            id: element._id,
          };

          tempUrlList.push(tempData);
        } else if (element.type == "file") {
          const tempData = {
            name: element.name,
            file: null,
            count: element.num_of_characters,
            id: element._id,
          };
          tempFileList.push(tempData);
        } else if (element.type == "youtubeTranscript") {
          const tempData = {
            url: element.url,
            file_name: "",
            text_length: element.num_of_characters,
            id: element._id,
          };

          tempYoutubeList.push(tempData);
        }
      });

      setFiles({
        isChanged: false,
        data: tempFileList,
      });

      setWebsiteLink({
        isChanged: false,
        data: tempUrlList,
      });

      setYoutube({
        isChanged: false,
        data: tempYoutubeList,
      });

      if (tempQaList.length > 0) {
        const isQaLoaded = await loadQaData(
          tempQaList[0].id,
          tempQaList[0].sourceId
        );
        if (!isQaLoaded) {
          return;
        }
      }

      if (tempTextList.length > 0) {
        const isTextLoaded = await loadTextData(
          tempTextList[0].id,
          tempTextList[0].sourceId
        );
        if (!isTextLoaded) {
          return;
        }
      }

      setIsLoaded(true);
    } else {
      toast.error(res.message);
    }
  }

  async function loadTextData(id, sourceId) {
    const res = await fetchChatbotSource(id, "source", sourceId);

    if (res.data) {
      if (res.data.chatbot_source.length > 0) {
        const tempData = {
          chatbotId: res.data.chatbot_source[0].chat_model_id,
          chatbotSourceDetailId:
            res.data.chatbot_source[0].chat_bot_source_detail_id,
          text: res.data.chatbot_source[0].source_data,
        };
        setText(tempData);
      } else {
        console.log("No default data exist for text");
      }
      return true;
    } else {
      toast.error(res.data);
    }

    return false;
  }

  async function loadQaData(id, sourceId) {
    const res = await fetchChatbotSource(id, "source", sourceId);

    if (res.data) {
      // console.log(res.data)
      if (res.data.chatbot_source && res.data.chatbot_source.length > 0) {
        const arr = JSON.parse(res.data.chatbot_source[0].source_data);

        const tempData = {
          chatModelId: res.data.chatbot_source[0].chat_model_id,
          chatbotSourceDetailId:
            res.data.chatbot_source[0].chat_bot_source_detail_id,
          questions: arr.map((item) => item.question),
          answers: arr.map((item) => item.answer),
        };

        setQaData(tempData);
      } else {
        console.log("No default data exist for qa");
      }
      return true;
    } else {
      toast.error(res.data);
    }

    return false;
  }

  async function updateChatbot() {
    try {
      let failedCount = 0;
      let skipCount = 0;
      if (isSubmitProcessing) {
        console.log("process");
        return;
      }

      if (count > charLimit && charLimit != 0) {
        setLimitReachedMsg(
          "You have reached your maximum character limit. Please remove some data to continue or upgrade your plan."
        );
        return;
      }
      setIsSubmitProcessing(true);

      if (isOutside) {
        const newId = await getChatbotId();
        if (!newId) {
          console.log("failed to create id");
          setIsSubmitProcessing(false);
          return;
        }
        chatbotId.current = newId;
      } else {
        chatbotId.current = id;
      }

      if (files.isChanged) {
        const form = new FormData();
        let len = 0;
        files.data.forEach((element) => {
          if (element.file) {
            form.append(element.name, element.file);
            len++;
          }
        });

        if (len > 0) {
          const isSuccess = await createChatSourceFile(chatbotId.current, form);
          if (isSuccess == false) {
            failedCount += 1;
          } else {
            setFiles((old) => {
              const clone = structuredClone(old);
              clone.isChanged = false;
              return clone;
            });
          }
        }
      } else {
        skipCount += 1;
      }

      if (text.isChanged && text.text) {
        const isTextSuccess = await createChatSourceText(
          chatbotId.current,
          text.text,
          text.chatbotSourceDetailId
        );
        if (isTextSuccess == false) {
          failedCount += 1;
        } else {
          setText((old) => {
            const clone = structuredClone(old);
            clone.isChanged = false;
            return clone;
          });
        }
      } else {
        skipCount += 1;
      }

      if (websiteLink.isChanged) {
        // console.table(websiteLink)
        let collectedData = websiteLink.data.slice();

        collectedData = collectedData.filter((item) => item.file_name);
        const isLinkSuccess = await createChatSourceLink(
          chatbotId.current,
          collectedData
        );
        if (isLinkSuccess == false) {
          failedCount += 1;
        } else {
          setWebsiteLink((old) => {
            const clone = structuredClone(old);
            clone.isChanged = false;
            return clone;
          });
        }
      } else {
        skipCount += 1;
      }

      if (qaData.isChanged) {
        const arr = [];
        for (let index = 0; index < qaData.answers.length; index++) {
          if (qaData.questions[index] || qaData.answers[index]) {
            arr.push({
              question: qaData.questions[index],
              answer: qaData.answers[index],
            });
          }
        }
        const isQaSuccess = await createChatSourceQA(
          chatbotId.current,
          arr,
          qaData.chatbotSourceDetailId
        );
        if (isQaSuccess == false) {
          failedCount += 1;
        } else {
          setQaData((old) => {
            const clone = structuredClone(old);
            clone.isChanged = false;
            return clone;
          });
        }
      } else {
        skipCount += 1;
      }

      if (youtube.isChanged) {
        // console.table(websiteLink)
        let collectedData = youtube.data.slice();

        collectedData = collectedData.filter((item) => item.file_name);
        const isLinkSuccess = await createChatSourceYoutube(
          chatbotId.current,
          collectedData
        );
        if (isLinkSuccess == false) {
          failedCount += 1;
        } else {
          setYoutube((old) => {
            const clone = structuredClone(old);
            clone.isChanged = false;
            return clone;
          });
        }
      } else {
        skipCount += 1;
      }

      if (skipCount < 5) {
        if (failedCount > 0) {
          if (isOutside) {
            toast.error(
              "Failed to create chatbot, please try again after some time!"
            );
            // delete chatbot
            deleteChatbot(chatbotId.current);
          } else {
            toast.error("Failed to update some sources");
          }
        } else if (isOutside) {
          toast.success("Chatbot created successfully");
          router.push("/my-chatbot/update/" + chatbotId.current);
        } else {
          toast.success("Chatbot updated successfully");
        }
      } else {
        toast.error("Please update something first!");
      }
    } catch (error) {
      console.log(error);
    }

    setIsSubmitProcessing(false);
  }

  async function createChatSourceFile(chatbotId, form) {
    // sending data to server
    const res = await createChatSourceByFile(chatbotId, form);
    if (res.data) {
      return true;
    } else {
      toast.error(res.message);
      return false;
    }
  }

  async function createChatSourceText(
    chatbotId,
    textValue,
    chatSourceId = null
  ) {
    // sending data to server
    let res = null;
    if (chatSourceId) {
      res = await updateChatSource(chatbotId, chatSourceId, textValue, "text");
    } else {
      res = await createChatSourceByText(chatbotId, textValue);
    }

    if (res.data) {
      return true;
    } else {
      toast.error(res.message);
      return false;
    }
  }

  async function createChatSourceLink(id, data) {
    // sending data to server
    const res = await createChatSourceByLink(id, data);
    if (res.data) {
      return true;
    } else {
      toast.error(res.message);
      return false;
    }
  }

  async function createChatSourceYoutube(id, data) {
    // sending data to server
    const res = await createChatSourceByYoutube(id, data);
    if (res.data) {
      return true;
    } else {
      toast.error(res.message);
      return false;
    }
  }

  async function createChatSourceQA(chatbotId, arr, chatSourceId) {
    let res = null;
    if (chatSourceId) {
      res = await updateChatSource(chatbotId, chatSourceId, arr, "qa");
    } else {
      res = await createChatSourceByQuestion(chatbotId, arr);
    }

    if (res.data) {
      return true;
    } else {
      toast.error(res.message);
      return false;
    }
  }

  const { canChatbotWrite } = useRole();

  return (
    <>
      {isOutside == true && (
        <div className="tab-outside hide-scroll">
          {tabContent.map((value, index) => {
            return (
              <Link
                className={value.text == "Youtube" && "youtube"}
                key={index}
                href={_generateSubTabLink(index)}
              >
                <div className={activeTab == index ? "tab active" : "tab"}>
                  <img src={value.icon} />
                  {value.text}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="main-content-holder small" style={{ paddingBottom: 0 }}>
        <div className="header hide-scroll">
          {isOutside == false &&
            tabContent.map((value, index) => {
              return (
                <Link
                  className={value.text == "Youtube" && "youtube"}
                  key={index}
                  href={generateSubTabLink(index)}
                >
                  <div className={activeTab == index ? "tab active" : "tab"}>
                    <img src={value.icon} />
                    {value.text}
                  </div>
                </Link>
              );
            })}

          {isOutside == true && (
            <>
              <img className="icon" src={logo.src} alt="logo" />
              {/* <button className="reset-btn hover" onClick={clear}>
                Reset
              </button> */}
            </>
          )}
        </div>

        <div className="content files">
          <div className={activeTab == 0 ? "files-holder" : ""}>
            <div>
              {isLoaded ? (
                <>
                  {activeTab == 0 && (
                    <Files files={files} setFiles={setFiles} count={count} />
                  )}
                  {activeTab == 1 && (
                    <Text text={text} setText={setText} count={count} />
                  )}
                  {activeTab == 2 && (
                    <WebsiteLink
                      setIsBusy={setIsBusy}
                      websiteLink={websiteLink}
                      setWebsiteLink={setWebsiteLink}
                      count={count}
                    />
                  )}
                  {activeTab == 3 && (
                    <Help
                      onAddMore={onQaAdd}
                      onRemove={onQaRemove}
                      qaData={qaData}
                      setQaData={setQaData}
                      count={count}
                    />
                  )}
                  {activeTab == 4 && (
                    <Youtube
                      youtube={youtube}
                      setYoutube={setYoutube}
                      count={count}
                      setIsBusy={setIsBusy}
                    />
                  )}
                </>
              ) : (
                <>
                  <div className="skeleton text"></div>
                  <div className="skeleton text"></div>
                  <div className="skeleton text"></div>
                  <div className="skeleton text"></div>
                  <div className="skeleton text"></div>
                </>
              )}

              <hr />
              <div className="limit-container">
                <div>
                  <h4>Sources</h4>
                  <p>
                    File : <span>{files.data.length} files</span>
                  </p>
                  <p>
                    Text : <span>{text.text.length} chars</span>
                  </p>
                  <p>
                    Link : <span>{websiteLink.data.length} links</span>
                  </p>
                  <p>
                    Q&A :{" "}
                    <span>
                      {qaData.questions.filter((question) => question).length +
                        " qa's"}
                    </span>
                  </p>
                  <p>
                    Youtube : <span>{youtube.data.length} links</span>
                  </p>
                  <p>
                    Total detected characters : <span>{count}/</span>
                    {charLimit.toLocaleString() + " "} limit
                  </p>
                </div>
                <button
                  disabled={!canChatbotWrite}
                  className="hover"
                  onClick={updateChatbot}
                >
                  {isSubmitProcessing == true ? (
                    <span className="loading small"></span>
                  ) : (
                    <>{!isOutside ? "Retrain Chatbot" : "Create Chat"}</>
                  )}
                </button>
              </div>
            </div>
          </div>

          <LimitReachDialog
            isOpen={limitReachedMsg != ""}
            message={limitReachedMsg}
            onDialogClose={() => setLimitReachedMsg("")}
          />
          {/* {activeTab == 0 && (
            <Files chatbotId={chatbotId.current} files={files} setFiles={setFiles} isClear={isClear} setIsClear={setIsClear} isEditMode={!isOutside} />
          )}
          {activeTab == 1 && <Text isClear={isClear} setIsClear={setIsClear} isEditMode={!isOutside} />}
          {activeTab == 2 && (
            <WebsiteLink isClear={isClear} setIsClear={setIsClear} isEditMode={!isOutside} />
          )}
          {activeTab == 3 && <Help isClear={isClear} setIsClear={setIsClear} qaList={qaList} isEditMode={!isOutside} />} */}
        </div>
      </div>
    </>
  );
}
