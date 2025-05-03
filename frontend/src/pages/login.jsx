import React, { useEffect, useRef, useState } from "react";
import "../styles/login.css";

import { logIn } from "../lib/api/ApiAuth";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";
import googleIcon from "../assets/google.svg";
import Head from "next/head";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const { verified } = router.query;

  const [isSubmit, setIsSubmit] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const formData = useRef({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (verified === "true") {
      toast.success("Account verified successfully, please login to continue.");
    }
  }, [verified]);

  async function onEmailFormSubmit() {
    if (isSubmit) return;

    // Reset previous error messages
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    // Validate email first, then password
    if (formData.current.email === "") {
      setEmailError("Please enter your email");
      return; // Stop here and show the email error first
    }

    if (formData.current.password === "") {
      setPasswordError("Please enter your password");
      return; // Stop here and show the password error
    }

    setIsSubmit(true);
    const res = await logIn(formData.current.email, formData.current.password);
    setIsSubmit(false);
    if (res.data) {
      localStorage.setItem("access_token", res.data.token);
      router.push("/my-chatbot");
    } else {
      setGeneralError(res.message || "An error occurred while logging in.");
    }
  }

  return (
    <div className="login">
      <Head>
        <title>
          Log In to UrbanChat.ai - Access AI-Powered Customer Support Solutions
        </title>
        <meta
          name="description"
          content="Unlock the full potential of AI chatbots. Sign in to your account and access advanced features and transform your business with our powerful conversational AI solutions."
          key="desc"
        />
      </Head>
      <div className="page">
        <div className="email-box box">
          <h2>Access AI-Powered Customer Support Solutions</h2>
          <p>Enter your email and password to login</p>
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

          <p className="left">
            <Link href="/password-reset">Forgot password?</Link>
          </p>

          <button onClick={onEmailFormSubmit} className="hover">
            {isSubmit ? <span className="loading small"></span> : "Login"}
          </button>

          {/* General error message */}
          {generalError && <p className="error">{generalError}</p>}

          <p className="center">
            Don&rsquo;t have an account? <Link href="/sign-up">Sign Up</Link>
          </p>
          <br />

          <hr />
          {/* <button
            onClick={() =>
              (window.location.href =
                "https://backend.urbanchat.ai/api/auth/google")
            }
            className="hover google"
          >
            <img src={googleIcon.src} alt="google login" /> Google
          </button> */}

          {/* <GoogleLogin onSuccess={handleSuccess} onError={() => console.log("Login Failed")} /> */}
          <br />
          <p>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
