import React, { useRef, useState } from "react";
import "../styles/login.css";

import { signUp } from "../lib/api/ApiAuth";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";
import googleIcon from "../assets/google.svg";
import Head from "next/head";

export default function SignUp() {
  const router = useRouter();

  const [isSubmit, setIsSubmit] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const formData = useRef({
    email: "",
    password: "",
  });

  const [activePage, setActivePage] = useState("sign-up"); // sign-up, confirm-email

  async function onEmailFormSubmit() {
    setEmailError(""); // Reset error state
    setPasswordError("");
    setGeneralError("");

    if (isSubmit) return;

    if (formData.current.email === "") {
      setEmailError("Please enter email");
      return;
    }

    if (formData.current.password === "") {
      setPasswordError("Please enter password");
      return;
    }

    setIsSubmit(true);

    const res = await signUp(formData.current.email, formData.current.password);
    setIsSubmit(false);

    if (res.data) {
      setActivePage("confirm-email");
    } else {
      setGeneralError(res.message || "An error occurred while signing up.");
    }
  }

  return (
    <div className="login">
      <Head>
        <title>
          Sign Up for UrbanChat.ai - Elevate Your Customer Support with AI
        </title>
        <meta
          name="description"
          content="Sign up on urbanchat for free to unlock 24/7 automated customer service, multilingual capabilities, and advanced analytics - all powered by cutting-edge AI technology."
          key="desc"
        />
      </Head>
      <div className="page">
        {activePage === "sign-up" && (
          <div className="email-box box">
            <h2>Join the AI-Powered Customer Experience Revolution</h2>
            <p>
              Unlock Your Path to Boosted Sales - <b>Start for Free!</b>
            </p>
            <br />
            <div className="input-holder">
              <span className="input-box-heading">Email</span>
              <input
                type="email"
                onChange={(e) => (formData.current.email = e.target.value)}
              />
              {emailError && <span className="error">{emailError}</span>}
            </div>
            <div className="input-holder">
              <span className="input-box-heading">Password</span>
              <input
                type="password"
                onChange={(e) => (formData.current.password = e.target.value)}
              />
              {passwordError && <span className="error">{passwordError}</span>}
            </div>

            <button onClick={onEmailFormSubmit} className="hover">
              {isSubmit ? (
                <span className="loading small"></span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* General error message */}
            {generalError && <p className="error">{generalError}</p>}

            <p className="center">
              Already have an account? <Link href="/login">Log In</Link>
            </p>
            <br />

            <hr />
            <button
              onClick={() =>
                (window.location.href =
                  "https://backend.urbanchat.ai/api/auth/google")
              }
              className="hover google"
            >
              <img src={googleIcon.src} alt="google login" /> Google
            </button>
            <br />
            <p>
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        )}

        {activePage === "confirm-email" && (
          <div className="msg-box">
            <h2>Activate your account</h2>
            <p>
              Your account has been created successfully. Please check your
              email to activate your account.
            </p>
            <Link href="/">
              <button className="hover outline">Go to Home</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
