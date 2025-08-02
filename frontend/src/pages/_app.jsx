import "../styles/page.css";
import "@/styles/tailwind.css";
import "@/styles/extra-temp.css";
import "@/styles/radix-ui.css";
import { Toaster } from "react-hot-toast";
import { createContext, useEffect, useState } from "react";
import myProfileImage from "../assets/MyProfileImage.png";
import { ThemeProvider } from "next-themes";
import Notification from "../components/NotificationContext";
import Router from "next/router";
import NProgress from "nprogress"; //nprogress module
import "nprogress/nprogress.css"; //styles of nprogress
import "@/styles/nprogress/override.css";
import Head from "next/head";
import icon from "@/assets/logo2.png";
import Script from "next/script";
import { AppProvider } from "@/context/AppContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
// import HomePageLayout from "@/components/layout/pageLayout";

NProgress.configure({ showSpinner: false });

//Route Events.
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export const ProfileContext = createContext();

function getProfileImage() {
  let image = localStorage.getItem("profile_image");
  if (!image) image = myProfileImage.src;

  return image;
}

export default function App({ Component, pageProps }) {
  const [globalProfileData, setGlobalProfileData] = useState({
    image: myProfileImage.src,
  });

  useEffect(() => {

    const event = new Event("storage");
    window.dispatchEvent(event);
    setGlobalProfileData({
      image: getProfileImage(),
    });
  }, []);

  const GTM_ID = "G-JN1N179T5M";

  return (
    <>
      <main>
        <Head>
          <link rel="icon" href={icon.src} sizes="any" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
          />
        </Head>


        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_OAUTH}>

        <ThemeProvider forcedTheme="dark">
          <ProfileContext.Provider
            value={{ globalProfileData, setGlobalProfileData }}
          >
            <AppProvider>
              {/* <HomePageLayout> */}
              <Component {...pageProps} />
              {/* </HomePageLayout> */}
            </AppProvider>
          </ProfileContext.Provider>
          <Notification />
          <Toaster position="bottom-center" reverseOrder={false} />
        </ThemeProvider>
</GoogleOAuthProvider>

     
      </main>
      <Script id="gtm" strategy="afterInteractive">
        {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtag/js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `}
      </Script>
      <Script
        src="//mozilla.github.io/pdf.js/build/pdf.mjs"
        strategy="afterInteractive"
        type="module"
      ></Script>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Define fbAsyncInit and initialize the SDK
          window.fbAsyncInit = function () {
            window.FB.init({
              appId: "1307695930443249", // your app ID
              autoLogAppEvents: true,
              xfbml: true,
              version: "v22.0", // Graph API version
            });
          };
        }}
      />
    </>
  );
}
