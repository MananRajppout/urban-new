import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.svg";
import { useApp } from "@/context/AppContext";

const Logo = () => {
  const { websiteSettings } = useApp();
  return (
    <div
      className="flex items-center justify-center h-16"
      style={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Link
        href="/"
        className="flex items-center transition-transform hover:scale-105 duration-200"
      >
        <img src={ websiteSettings?.logo || logo} alt="logo" width={140} height={100} />
      </Link>
    </div>
  );
};

export default Logo;
