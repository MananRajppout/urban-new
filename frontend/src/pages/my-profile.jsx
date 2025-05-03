import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import sp_logo from "../assets/sp_logo.png";
import wa_logo from "../assets/wa_logo.png";
import wp_logo from "../assets/wp_logo.png";
import myProfileImage from "@/assets/MyProfileImage.png";
import { convertToCustomFormat, formatDateTime } from "../Utils";
import "@/styles/my-profile.css";
import ProfileDialog from "../components/Dialog/ProfileDialog";
import { getRestriction, getUserDetail } from "../lib/api/ApiExtra";
import toast from "react-hot-toast";
import DeleteDialog from "@/components/Dialog/DeleteDialog";
import Head from "next/head";
import Link from "next/link";
import { useRole } from "@/hooks/useRole";
function MyProfile() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isRestrictionLoaded, setIsRestrictionLoaded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileContainerRef = useRef(null);
  const iconHolderRef = useRef(null);
  const buttonHolderRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    image: myProfileImage.src,
    count: 0,
    isWhatsapp: false,
    isFacebook: false,
    isShopify: false,
    isWordpress: false,
    currentPlan: {},
  });

  useEffect(() => {
    loadUserDetails();
    loadRestriction();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // GSAP Animations for profile container
      gsap.fromTo(
        profileContainerRef.current,
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out" }
      );

      // GSAP Animations for icons
      gsap.fromTo(
        iconHolderRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          delay: 0.5,
          ease: "power3.out",
        }
      );

      // GSAP Animations for buttons
      gsap.fromTo(
        buttonHolderRef.current.children,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          delay: 1,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [isLoaded]);

  async function loadUserDetails() {
    const res = await getUserDetail();
    if (res.data) {
      setProfileData({
        name: res.data.user.full_name || "No Name",
        email: res.data.user.email,
        image: res.data.user.profile_image || myProfileImage.src,
        count: res.data.chatbot_count,
        isWhatsapp: res.data.integrated_details.is_whatsapp_integrated,
        isFacebook: res.data.integrated_details.is_facebook_integrated,
        isShopify: res.data.integrated_details.is_shopify_integrated,
        isWordpress: res.data.integrated_details.is_wordpress_integrated,
        currentPlan: res.data.current_plan,
      });
      setIsLoaded(true);
    } else {
      toast.error(res.message);
    }
  }

  const [restrictionData, setRestrictionData] = useState({
    msg: "",
    expiryTime: "",
  });

  async function loadRestriction() {
    const res = await getRestriction();
    if (res.data) {
      const msg = `${res.data.restriction.consumed_messages_user}/${res.data.restriction.quota_messages_user}`;
      setRestrictionData({
        msg,
        expiryTime:
          res.data.restriction.renewal_time || new Date().toUTCString(),
      });
      setIsRestrictionLoaded(true);
    } else {
      toast.error(res.message);
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("profile_image");
    window.location.replace("/signinx1");
  }
  const { canUserInvite } = useRole();

  return (
    <>
      <Head>
        <title>
          Manage Your UrbanChat.ai Profile - Personalize Your Chatbot Experience
        </title>
        <meta
          name="description"
          content="Customize your UrbanChat.ai profile to personalize your chatbot experience. Take control of your customer engagement strategy with UrbanChat.ai."
          key="desc"
        />
      </Head>
      <div className="my-profile">
        <div className="page">
          <h2>Manage Your AI Chatbot Solutions Account</h2>
          {!isLoaded ? (
            <div>
              <div className="skeleton wide" style={{ height: 300 }}></div>
            </div>
          ) : (
            <div className="profile-box" ref={profileContainerRef}>
              <img src={profileData.image} alt="Profile" />
              <div>
                <h2>{profileData.name}</h2>
                <p>{profileData.email}</p>
                <div className="icon-holder" ref={iconHolderRef}>
                  {profileData.isWhatsapp && (
                    <img src={wa_logo.src} alt="WhatsApp" />
                  )}
                  {profileData.isFacebook && (
                    <img src={wa_logo.src} alt="Facebook" />
                  )}
                  {profileData.isShopify && (
                    <img src={sp_logo.src} alt="Shopify" />
                  )}
                  {profileData.isWordpress && (
                    <img src={wp_logo.src} alt="WordPress" />
                  )}
                </div>
                <div className="bottom">
                  <span className="label">
                    {profileData.count.toString().padStart(2, "0")} Chatbot
                    Created
                  </span>
                  {canUserInvite && (
                    <button>
                      <Link href="/ManageUser">Go to Manage User</Link>
                    </button>
                  )}
                  <button
                    className="hover primary"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoaded && (
            <div className="plan-box">
              <p className="title">CURRENTLY USING PLAN</p>
              <h3>{profileData.currentPlan.name} Plan</h3>
              <ul>
                <li>
                  {profileData.currentPlan.messages_quota_user} Message credits/
                  Month
                </li>
                <li>
                  {profileData.currentPlan.allowed_characters} / Chatbot
                  characters
                </li>
                <li>
                  {profileData.currentPlan.number_of_chatbots} Chatbots Allowed
                </li>
                {profileData.currentPlan.facebook_allowed && (
                  <li>Facebook Integration</li>
                )}
                {profileData.currentPlan.whatsapp_allowed && (
                  <li>Whatsapp Integration</li>
                )}
                {profileData.currentPlan.shopify_allowed && (
                  <li>Shopify Integration</li>
                )}
                {profileData.currentPlan.wordpress_allowed && (
                  <li>Wordpress Integration</li>
                )}
                <li>Embed on unlimited websites</li>
                <li>Upload multiple files</li>
                <li>View conversation history</li>
                <li>Capture leads</li>
                <li>Chatbots get deleted after 07 days of in-activity</li>
              </ul>

              <br />
              <h3>Sub Plan For You</h3>
              <p>Extra Messages $ 07 Per 1000 Msg Credits/Month</p>
              <button className="hover">Upgrade Plan</button>
            </div>
          )}

          {isRestrictionLoaded == false ? (
            <div>
              <div className="skeleton wide" style={{ height: 200 }}></div>{" "}
              <br />
              <br />
            </div>
          ) : (
            <div className="uses-box">
              <h3>Usage</h3>
              <p>
                Message consumed: <span>{restrictionData.msg}</span>
              </p>
              <p>
                Your credits renew at the start of every calendar month. <br />
                Next renewal :{" "}
                <span>{convertToCustomFormat(restrictionData.expiryTime)}</span>
              </p>
            </div>
          )}

          <div className="uses-box">
            <h3>UrbanChat API Key</h3>
            <p>Subscription required to get an API key.</p>
          </div>

          <div className="button-holder" ref={buttonHolderRef}>
            <button onClick={logout} className="hover">
              Logout Now
            </button>
            <button className="danger hover" onClick={() => setIsDelete(true)}>
              Delete My Account
            </button>
          </div>
          {isLoaded && (
            <ProfileDialog
              isOpen={isProfileOpen}
              onDialogClose={() => setIsProfileOpen(false)}
              profileData={profileData}
              setProfileData={setProfileData}
            />
          )}
          {isDelete && (
            <DeleteDialog
              isOpen={isDelete}
              onDialogClose={() => setIsDelete(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default MyProfile;
