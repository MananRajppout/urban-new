import React, { useRef, useState } from "react";
import "../styles/password-reset.css";
import { resetPassword, sendOtp, verifyOtp } from "../lib/api/ApiExtra";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

export default function PasswordReset() {
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isSubmit, setIsSubmit] = useState(false);

  const formData = useRef({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    token: "",
  });

  async function onEmailFormSubmit() {
    if (isSubmit) return;

    if (formData.current.email == "") {
      toast.error("Please enter email");
      return;
    }
    setIsSubmit(true);
    const res = await sendOtp(formData.current.email);
    setIsSubmit(false);
    if (res.data) {
      setActiveIndex(1);
    } else {
      toast.error(res.message);
    }
  }

  async function onOtpFormSubmit() {
    if (isSubmit) return;
    if (formData.current.otp == "") {
      toast.error("Please enter otp");
      return;
    }

    setIsSubmit(true);
    const res = await verifyOtp(formData.current.email, formData.current.otp);
    setIsSubmit(false);
    if (res.data) {
      formData.current.token = res.data.token;
      localStorage.setItem("access_token", res.data.token);
      setActiveIndex(2);
    } else {
      toast.error(res.message);
    }
  }

  async function onChangePasswordFormSubmit() {
    if (isSubmit) return;
    if (
      formData.current.password == "" ||
      formData.current.confirmPassword == ""
    ) {
      toast.error("Please enter password");
      return;
    }

    if (formData.current.password != formData.current.confirmPassword) {
      toast.error("Password and confirm password does not match");
      return;
    }

    setIsSubmit(true);
    const res = await resetPassword(formData.current.password);
    setIsSubmit(false);
    if (res.data) {
      router.push("/");
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="password-reset">
      <Head>
        <title>Reset Your Password Easily - UrbanChat.ai Support</title>
        <meta
          name="description"
          content="Reset your UrbanChat.ai password securely and conveniently. Regain access to your account and chatbot management tools with our easy-to-use password reset process."
          key="desc"
        />
      </Head>
      <div className="page">
        {activeIndex == 0 && (
          <div className="email-box box">
            <h2>Regain Access to Your AI-Powered Support Solutions</h2>
            <p>
              Enter your email to receive instructions on how to reset your
              password.
            </p>
            <div className="input-holder">
              <span>Email</span>
              <input
                type="email"
                onChange={(e) => (formData.current.email = e.target.value)}
              />
            </div>

            <button onClick={onEmailFormSubmit} className="hover primary">
              {isSubmit ? (
                <span className="loading small"></span>
              ) : (
                "Reset password"
              )}
            </button>
            <p className="center">
              Remember your password? <Link href="/signin">Login</Link>
            </p>
          </div>
        )}

        {activeIndex == 1 && (
          <div className="email-box box">
            <h2>Verify OTP</h2>
            <p>We have sent the 6 digit otp on your email</p>
            <div className="input-holder">
              <span>OTP</span>
              <input
                type="text"
                onChange={(e) => (formData.current.otp = e.target.value)}
              />
            </div>

            <button onClick={onOtpFormSubmit} className="hover primary">
              {isSubmit ? (
                <span className="loading small"></span>
              ) : (
                "Verify OTP"
              )}
            </button>
            <p className="center">
              Remember your password? <Link href="/signin">Login</Link>
            </p>
          </div>
        )}

        {activeIndex == 2 && (
          <div className="email-box box">
            <h2>Change Password</h2>
            <p>Enter your new password for your account.</p>
            <div className="input-holder">
              <span>New Password</span>
              <input
                type="password"
                onChange={(e) => (formData.current.password = e.target.value)}
              />
            </div>

            <div className="input-holder">
              <span>Confirm Password</span>
              <input
                type="password"
                onChange={(e) =>
                  (formData.current.confirmPassword = e.target.value)
                }
              />
            </div>

            <button
              onClick={onChangePasswordFormSubmit}
              className="hover primary"
            >
              {isSubmit ? (
                <span className="loading small"></span>
              ) : (
                "Reset password"
              )}
            </button>
            <p className="center">
              Remember your password? <Link href="/signin">Login</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
