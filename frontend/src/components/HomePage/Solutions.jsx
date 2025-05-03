import React, { useEffect, useRef } from "react";
import "../../styles/HomePage/solutions.css";
import Link from "next/link";
import corporateImg from "@/assets/home/corporate.png";
import webSoftImg from "@/assets/home/web-soft.png";
import marketingImg from "@/assets/home/marketing.png";

export default function SolutionsSection() {
  return (
    <section className="solutions-section">
      <div className="page">
        <h2>Solution for all industries</h2>
        <div className="card-holder">
          <div className="card">
            <img src={corporateImg.src} alt="corporate img" />
            <span>Corporate</span>
          </div>
          <div className="card">
            <img src={webSoftImg.src} alt="web-soft img" />
            <span>Web & software</span>
          </div>
          <div className="card">
            <img src={marketingImg.src} alt="marketing img" />
            <span>Marketing</span>
          </div>
        </div>
        <button className="hover outline">View all category</button>
      </div>
    </section>
  );
}
