import React, { useContext, useEffect, useState } from "react";
import "../../styles/CreateChatbot/common.css";
import "../../styles/Dialog.css";
import "../../styles/CreateChatbot/extra-tab-common.css";
import logo from "../../assets/logo.svg";
import whatsapp from "../../assets/Icons/whatsapp.svg";
import wordpress from "../../assets/Icons/wordpress.svg";
import shopify from "../../assets/Icons/shopify.svg";
import messenger from "../../assets/Icons/facebook-messenger.svg";
import calendly from "../../assets/Icons/calendly.svg";

import WhatsAppDialog from "../Dialog/WhatsAppDialog";
import FacebookDialog from "../Dialog/FacebookDialog";
import { ServerDataContext } from "../../pages/my-chatbot/update/[id]";
import ShopifyDialog from "../Dialog/ShopifyDialog";
import CalendlyDialog from "../Dialog/CalendlyDialog";
import { useRouter } from "next/router";
import {
  addInstagramIntegration,
  addWhatsappIntegration,
} from "@/lib/api/ApiUpdateChatbot";
import { set } from "nprogress";
import axios from "axios";

export default function Integrates() {
  const { serverData, setServerData } = useContext(ServerDataContext);

  const [isWhatsapp, setIsWhatsapp] = useState(false);
  const [isFacebook, setIsFacebook] = useState(false);
  const [isShopify, setIsShopify] = useState(false);
  const [isCalendly, setIsCalendly] = useState(false);

  function onWhatsappDialogClose() {
    setIsWhatsapp(false);
  }

  function onFacebookDialogClose() {
    setIsFacebook(false);
  }

  function onShopifyDialogClose() {
    setIsShopify(false);
  }

  function onCalendlyDialogClose() {
    setIsCalendly(false);
  }
  const router = useRouter();
  const { id } = router.query;
  const [fbToken, setFbToken] = useState(null);
  const [eventData, setEventData] = useState(null);
  useEffect(() => {
    window.addEventListener("message", handleMessageEvent);
    return () => {
      window.removeEventListener("message", handleMessageEvent);
    };
  }, []);

  const handleMessageEvent = (event) => {
    if (
      event.origin !== "https://www.facebook.com" &&
      event.origin !== "https://web.facebook.com"
    )
      return;
    try {
      const data = JSON.parse(event.data);

      if (data.type === "WA_EMBEDDED_SIGNUP") {
        console.log("WA_EMBEDDED_SIGNUP message event: ", event); // remove after testing
        setEventData(data);
      }
    } catch {
      // console.log("message event ERROR: ", event.data); // remove after testing
      // your code goes here
    }
  };

  const fbLoginCallback = (response) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      setFbToken(code);
      // const formData = {
      //   whatsapp_phone_number: "",
      //   phone_number_id: code.data.phone_number_id,
      //   whatsapp_business_ac_id: code.data.waba_id,
      //   api_key: "",
      //   chat_model_id: id,
      //   is_active: true,
      //   integrate_id: "",
      // };
      // const res = addWhatsappIntegration(id, formData);
    } else {
      console.log("response: ", response);
      // your additional code goes here
    }
  };

  // Function to trigger the Facebook login
  const launchWhatsAppSignup = () => {
    if (window.FB) {
      window.FB.login(fbLoginCallback, {
        config_id: "1353202325700601", // your configuration ID goes here
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "3",
        },
      });
    } else {
      console.log("Facebook SDK not loaded yet.");
    }
  };

  const launchInstagramSignup = () => {
    const res = addInstagramIntegration("18425ecb-22de-4f07-9d0e-3fd71b4e5e9c");
    const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=646819141091380&redirect_uri=https://www.urbanchat.ai/my-chatbot&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
    window.open(authUrl, "_blank", "noopener,noreferrer,width=800,height=600");
  };

  const addData = async () => {
    const clientId = "1307695930443249";
    const clientSecret = "425a72d22379b692b85c3589c8fb03f5";
    const accessCode = fbToken;

    const waba_id = eventData.data.waba_id;
    const phone_id = eventData.data.phone_number_id;
    const url = `https://graph.facebook.com/v21.0/oauth/access_token`;
    const subscribeUrl = `https://graph.facebook.com/v22.0/${waba_id}/subscribed_apps`;
    const registerUrl = `https://graph.facebook.com/v22.0/${phone_id}/register`;
    try {
      const response = await axios.get(url, {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          code: accessCode,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const access_token = response.data.access_token;
      console.log("Facebook Access Token:", access_token);
      const subscribeResponse = await axios.post(
        subscribeUrl,
        {}, // No body required
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      console.log(subscribeResponse.data);
      const regResponse = await axios.post(
        registerUrl,
        { messaging_product: "whatsapp", pin: "000000" },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      console.log(regResponse.data);

      const formData = {
        whatsapp_phone_number: "",
        phone_number_id: phone_id,
        whatsapp_business_ac_id: waba_id,
        api_key: access_token,
        chat_model_id: id,
        is_active: true,
        integrate_id: "",
      };
      const res = await addWhatsappIntegration(id, formData);
      console.log(res.data);
      // Your additional logic using fbToken and eventData
    } catch (error) {
      console.error(
        "Error fetching access token:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      <div className="main-content-holder small integrates">
        <div className="header">
          <img className="icon" src={logo.src} alt="logo" />
        </div>
        {/* <button onClick={() => addData()}>updated data</button> */}
        <div className="content">
          <button className="tab-button">
            <img src={wordpress.src} />
            <span className="responsive-hide">Add to Wordpress</span>
            {serverData.integrate_details.is_wordpress_integrated ? (
              <span className="default blue">Added</span>
            ) : (
              <span className="default green">Coming Soon</span>
            )}
          </button>

          <button className="tab-button">
            <img src={shopify.src} />

            <span className="responsive-hide">Add to Shopify</span>
            {serverData.integrate_details.is_shopify_integrated ? (
              <span className="default blue">Added</span>
            ) : (
              <span
                className="default hover"
                onClick={() => setIsShopify(true)}
              >
                Add manually
              </span>
            )}
          </button>

          <button className="tab-button">
            <img src={whatsapp.src} />
            <span className="responsive-hide">Add to Whatsapp</span>
            {serverData.integrate_details.is_whatsapp_integrated ? (
              <span
                className="default blue hover"
                onClick={() => setIsWhatsapp(true)}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13.94 5 19 10.06 9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L13.938 5Zm7.09-2.03a3.578 3.578 0 0 1 0 5.06l-.97.97L15 3.94l.97-.97a3.578 3.578 0 0 1 5.06 0Z" />
                </svg>{" "}
                Added
              </span>
            ) : (
              <div>
                {!fbToken ? (
                  <span
                    className="default hover"
                    onClick={launchWhatsAppSignup}
                  >
                    Add
                  </span>
                ) : (
                  <span className="default hover" onClick={() => addData()}>
                    Save
                  </span>
                )}
              </div>
            )}
          </button>
          <button className="tab-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="32"
              height="32"
              viewBox="0 0 50 50"
              color="white"
            >
              <path d="M 16 3 C 8.8324839 3 3 8.8324839 3 16 L 3 34 C 3 41.167516 8.8324839 47 16 47 L 34 47 C 41.167516 47 47 41.167516 47 34 L 47 16 C 47 8.8324839 41.167516 3 34 3 L 16 3 z M 16 5 L 34 5 C 40.086484 5 45 9.9135161 45 16 L 45 34 C 45 40.086484 40.086484 45 34 45 L 16 45 C 9.9135161 45 5 40.086484 5 34 L 5 16 C 5 9.9135161 9.9135161 5 16 5 z M 37 11 A 2 2 0 0 0 35 13 A 2 2 0 0 0 37 15 A 2 2 0 0 0 39 13 A 2 2 0 0 0 37 11 z M 25 14 C 18.936712 14 14 18.936712 14 25 C 14 31.063288 18.936712 36 25 36 C 31.063288 36 36 31.063288 36 25 C 36 18.936712 31.063288 14 25 14 z M 25 16 C 29.982407 16 34 20.017593 34 25 C 34 29.982407 29.982407 34 25 34 C 20.017593 34 16 29.982407 16 25 C 16 20.017593 20.017593 16 25 16 z"></path>
            </svg>
            <span className="responsive-hide">Add to Instagram</span>
            {serverData.integrate_details.is_instagram_integrated ? (
              <span
                className="default blue hover"
                onClick={() => setIsWhatsapp(true)}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13.94 5 19 10.06 9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L13.938 5Zm7.09-2.03a3.578 3.578 0 0 1 0 5.06l-.97.97L15 3.94l.97-.97a3.578 3.578 0 0 1 5.06 0Z" />
                </svg>{" "}
                Added
              </span>
            ) : (
              <span className="default hover" onClick={launchInstagramSignup}>
                Add
              </span>
            )}
          </button>
          <button className="tab-button">
            <img src={messenger.src} />
            <span className="responsive-hide">Add to Facebook Messenger</span>

            {/* {serverData.integrate_details.is_facebook_integrated ? (
              <span
                className="default blue hover"
                onClick={() => setIsFacebook(true)}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13.94 5 19 10.06 9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L13.938 5Zm7.09-2.03a3.578 3.578 0 0 1 0 5.06l-.97.97L15 3.94l.97-.97a3.578 3.578 0 0 1 5.06 0Z" />
                </svg>{" "}
                Added
              </span>
            ) : (
              <span
                className="default hover"
                onClick={() => setIsFacebook(true)}
              >
                Add
              </span>
            )} */}
            <span className="default green">Coming soon</span>
          </button>

          <button className="tab-button">
            <img src={calendly.src} />
            <span className="responsive-hide">Enable calendly</span>
            {serverData.view[0].calendly_url ? (
              <span
                className="default blue hover"
                onClick={() => setIsCalendly(true)}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13.94 5 19 10.06 9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L13.938 5Zm7.09-2.03a3.578 3.578 0 0 1 0 5.06l-.97.97L15 3.94l.97-.97a3.578 3.578 0 0 1 5.06 0Z" />
                </svg>{" "}
                Disable
              </span>
            ) : (
              <span
                className="default hover"
                onClick={() => setIsCalendly(true)}
              >
                {serverData.chatbot_model.calendly_url ? "Enabled" : "Enable"}
              </span>
            )}
          </button>
        </div>
      </div>
      <WhatsAppDialog
        isOpen={isWhatsapp}
        onDialogClose={onWhatsappDialogClose}
        defaultIndex={
          serverData.integrate_details.is_whatsapp_integrated ? 2 : 0
        }
      />
      <FacebookDialog
        isOpen={isFacebook}
        onDialogClose={onFacebookDialogClose}
        defaultIndex={
          serverData.integrate_details.is_facebook_integrated ? 2 : 0
        }
      />

      <ShopifyDialog isOpen={isShopify} onDialogClose={onShopifyDialogClose} />
      <CalendlyDialog
        isOpen={isCalendly}
        onDialogClose={onCalendlyDialogClose}
      />
    </>
  );
}