import React from "react";

// import '@/styles/page.css'
import "@/styles/integration-page.css";
import image1 from "@/assets/shopify-integration/image1.png";
import image2 from "@/assets/shopify-integration/image2.png";
import image3 from "@/assets/shopify-integration/image3.png";
import image4 from "@/assets/shopify-integration/image4.png";
import image5 from "@/assets/shopify-integration/image5.png";
import image6 from "@/assets/shopify-integration/image6.png";
import Head from "next/head";

export default function ShopifyIntegration() {
  return (
    <>
      <Head>
        <title>Shopify integration</title>
        <meta
          name="description"
          content="Easily create an AI chatbot for your Shopify website with UrbanChat.ai. Enhance customer engagement, streamline support, and boost sales with a powerful virtual assistant tailored to your business."
          key="desc"
        />
      </Head>
      <section className="integration-page">
        <div className="page">
          <h1>How to install urbanchat.ai on the Shopify platform</h1>
          <p>This guide will take you through the integration process.</p>

          <h3>Step 1:</h3>
          <p>Copy the urbanchat.ai chatbot code</p>
          <img src={image1.src} alt="Copy the urbanchat.ai chatbot code" />

          <h3>Step 2:</h3>
          <p>On your Shopify dashboard, select Online Store.</p>

          <h3>Step 3:</h3>
          <p>Under Online Store, select Themes.</p>
          <img className="vertical" src={image2.src} alt="select theme" />

          <h3>Step 4:</h3>
          <p>
            On the top right, select <b>Actions &gt; Edit code</b>.
          </p>
          <img src={image3.src} alt="select action edit code" />

          <h3>Step 5:</h3>
          <p>
            Under <b>Layout</b>, select <b>theme.liquid</b>.
          </p>
          <img src={image4.src} alt="select theme.liquid" />

          <h3>Step 6:</h3>
          <p>
            Scroll down to the bottom and find this tag <b> &lt;/html&gt;</b>{" "}
            and paste the code you copied in <b>step 1</b>.
          </p>
          <img src={image5.src} alt="find html tag" />

          <h3>Step 7:</h3>
          <p>Select Save.</p>

          <h3>Step 8:</h3>
          <p>Test your chatbot.</p>
          <img src={image6.src} alt="test the chatbot" />
        </div>
      </section>
    </>
  );
}
