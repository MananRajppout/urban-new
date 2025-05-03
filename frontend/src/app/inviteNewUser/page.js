"use client";

import React, { useState, useEffect } from "react";
import { getUserDetail, resetPassword } from "@/lib/api/ApiExtra";
import toast from "react-hot-toast";
import formMobile from "@/assets/formMobile.png";
import main_logo from "@/assets/main_logo.png";
import "./InviteUser.css";

const InviteNewUser = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [userDetails, setUserDetails] = useState({ name: "", email: "" });
    const [new_password, setNew_password] = useState("");

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");

            if (token) {
                try {
                    localStorage.setItem("access_token", token);
                    const res = await getUserDetail();
                    
                    setUserDetails({
                        name: res.data.user.full_name,
                        email: res.data.user.email,
                    });
                } catch (error) {
                    toast.error("Failed to fetch user details");
                }
            } else {
                toast.error("Token is missing in the URL");
            }
        };
        Details();
    }, []);

    const handleSave = async () => {
        if (new_password.trim().length < 6) {
            toast.error("Password should be at least 6 characters long");
            return;
        }

        try {
            const response = await resetPassword(new_password);
            if (response.data.success) {
                toast.success(response.data.message);
                window.location.href = "/";
            } else {
                toast.error(response.data.message || "Failed to reset password");
            }
        } catch (error) {
            toast.error("Failed to reset password");
        }
    };

    return (
        <div className="InviteUser_container">
            <h1 className="mb-10">User Added</h1>
            <div className="header">
                <div className="title">
                    <img src={main_logo.src} alt="Main Logo" width={"200px"} />
                </div>
            </div>

            <div className="sub_container">

            <div className="form-container">
                <div className="input-container">
                    <label htmlFor="inviteUserName">Name</label>
                    <input type="text" id="inviteUserName" value={userDetails.name} readOnly />
                </div>
                <div className="input-container">
                    <label htmlFor="inviteUserEmail">Email</label>
                    <input type="email" id="inviteUserEmail" value={userDetails.email} readOnly />
                </div>
                <div className="input-container">
                    <label htmlFor="inviteUserPassword">Password</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="inviteUserPassword"
                            value={new_password}
                            onChange={(e) => setNew_password(e.target.value)}
                        />
                        <span onClick={togglePasswordVisibility}>
                            {showPassword ? "🙈" : "👁️"}
                        </span>
                    </div>
                    <p>Change the password</p>
                </div>
                <button onClick={handleSave}>Save</button>
            </div>

            

            <img src={formMobile.src} alt="Form Mobile"  height={"600px"} width={"400px"} />
            </div>
        </div>
    );
};

export default InviteNewUser;
