import React, { useEffect, useState } from "react";
// import "../../styles/page.css";
import "@/styles/MyChatbot/index.css";
import addIcon from "../../assets/Icons/addIcon.svg";
import image1 from "../../assets/Rectangle25.png";
import ChatCard from "../../components/MyChatbot/ChatCard";
import toast from "react-hot-toast";

import Link from "next/link";
import { getAllMyChatbot } from "../../lib/api/ApiCreateChatbot";
import Head from "next/head";
import { useRole } from "@/hooks/useRole";

// function useQuery() {
//   const router = useRouter();

//   return React.useMemo(
//     () => new URLSearchParams(router.asPath.split("?")[1] || ""),
//     [router.asPath]
//   );
// }

export default function MyChatbot() {
  // let query = useQuery();
  const [isLoaded, setIsLoaded] = useState(false);

  const [allChatbot, setAllChatbot] = useState([]);
  useEffect(function () {
    // alert(token)
    // if (query.get("token")) {
    //   localStorage.setItem("access_token", query.get("token"));
    // }
    loadChatBots();
  }, []);

  // async function test() {
  //   const res = await logIn("a9649060356@gmail.com", "test1234567");
  //   if (res.data) {
  //     // toast.success("Login successful");
  //     localStorage.setItem("access_token", res.data.token);
  //   } else {
  //     toast.error(res.message);
  //   }
  // }

  async function loadChatBots() {
    const res = await getAllMyChatbot();
    if (res.data) {
      const arr = res.data.view.map((element) => {
        const field = {
          type: "bot",
          title: element.name == "" ? element._id : element.name,
          chatbotId: element.chat_model_id,
          content: element.bot_picture == "" ? image1.src : element.bot_picture,
        };

        return field;
      });

      setAllChatbot(arr);
      setIsLoaded(true);
    } else {
      toast.error(res.message);
    }
  }
  const { isAdmin } = useRole();

  return (
    <>
      <Head>
        <title>
          Custom AI Chatbot Solutions for Your Business | UrbanChat.ai
        </title>
        <meta
          name="description"
          content="Customize AI chatbots to automate customer support, boost engagement, and drive efficiency. Empower your online presence and transform the customer experience."
          key="desc"
        />
      </Head>
      <section className="card-area">
        <div className="page">
          <div className="header">
            <div>
              <h1>Manage all Your ai chatbots at one place</h1>
              <span>{allChatbot.length} Chatbots</span>
            </div>
            <div className="buttons">
              {isAdmin && (
                <Link href="/my-chatbot/create">
                  <button>
                    <img src={addIcon.src} />
                    <span className="responsive-hide">New Chatbot</span>
                  </button>
                </Link>
              )}
              <Link href="/my-chatbot/statistics">
                <button className="stat">Statistics</button>
              </Link>
            </div>
          </div>

          <div className="skeleton">
            <p></p>
          </div>

          <div className="content">
            {isLoaded
              ? allChatbot.map((value, index) => {
                  return (
                    <ChatCard
                      key={index}
                      type={value.type}
                      title={value.title}
                      content={value.content}
                      chatbotId={value.chatbotId}
                    />
                  );
                })
              : [0, 1, 2, 3].map((item, index) => (
                  <div key={index} className="card skeleton"></div>
                ))}
          </div>
        </div>
      </section>
    </>
  );
}
