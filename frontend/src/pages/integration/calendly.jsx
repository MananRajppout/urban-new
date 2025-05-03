import React from "react";

// import '@/styles/page.css'
import "@/styles/integration-page.css";
import image1 from "@/assets/calendly-integration/img1.jpg";
import image2 from "@/assets/calendly-integration/image 9.jpg";
import image3 from "@/assets/calendly-integration/image 10.jpg";
import image4 from "@/assets/calendly-integration/image 11.jpg";
import image5 from "@/assets/calendly-integration/image 12.jpg";
import image6 from "@/assets/calendly-integration/image 14.jpg";
import image7 from "@/assets/calendly-integration/image 15.jpg";
import image8 from "@/assets/calendly-integration/image 16.jpg";
import image9 from "@/assets/calendly-integration/image 17.jpg";
import image10 from "@/assets/calendly-integration/image 18.jpg";
import image11 from "@/assets/calendly-integration/image 19.jpg";
import image12 from "@/assets/calendly-integration/image 20.jpg";
import image13 from "@/assets/calendly-integration/image 21.jpg";
import image14 from "@/assets/calendly-integration/image 22.jpg";
import image15 from "@/assets/calendly-integration/image 23.jpg";

import Head from "next/head";
import Link from "next/link";

export default function CalendlyIntegration() {
  return (
    <>
      <Head>
        <title>Calendly integration</title>
        <meta
          name="description"
          content="Seamlessly integrate your AI chatbot with Calendly to book appointments with website visitors. Streamline customer engagement, reduce manual scheduling, and boost efficiency."
          key="desc"
        />
      </Head>
      <section className="integration-page">
        <div className="page">
          <div>
            <h1>Connect Your Chatbot with Calendly</h1>
            <p>
              Now Let Your Customers Book Appointments Right Through Chatbots.
            </p>

            <h3>Step 1:</h3>
            <p>
              Create Your Chatbot on <Link href="/">UrbanChat.ai</Link> <br />
              Visit <Link href="/">UrbanChat.ai</Link> and create a new chatbot
              tailored to your needs.
            </p>
            <img src={image1.src} alt="create chatbot" />

            <h3>Step 2:</h3>
            <p>
              Provide your website Url or train your chatbot by text or
              documents
            </p>
            <img src={image2.src} alt="provide website url" />

            <h3>Step 3:</h3>
            <p>Train your chatbot</p>
            <img src={image3.src} alt="train chatbot" />

            <h3>Step 4:</h3>
            <p>Access the Integration Tab</p>
            <img src={image4.src} alt="access the integration tab" />

            <h3>Step 5:</h3>
            <p>Click on enable</p>
            <img src={image5.src} alt="click on enable" />

            <h3>Step 6:</h3>
            <p>Fill calendly url</p>
            <img src={image6.src} alt="enter calendly url" />

            <h3>Step 7:</h3>
            <p>
              Open a new tab. Visit <a href="https://calendly.com/">Calendly</a>
            </p>
            <img src={image8.src} alt="visit calendly.com" />

            <h3>Step 8:</h3>
            <p>Sign in with your existing account or sign up for a new one.</p>
            <img src={image7.src} alt="sign in to calendly" />

            <h3>Step 9:</h3>
            <p>
              Create an Event on Calendly <br />
              If you don't have an event yet, create a new event in your
              Calendly profile.
            </p>
            <img src={image9.src} alt="create event" />

            <h3>Step 10:</h3>
            <p>Choose your event type.</p>
            <img src={image10.src} alt="choose the event" />

            <h3>Step 11:</h3>
            <p>Fill up your details and click continue.</p>
            <img
              src={image11.src}
              alt="Fill up your details and click continue."
            />

            <h3>Step 12:</h3>
            <p>Select your preferred one.</p>
            <img src={image12.src} alt="Select your preferred one" />

            <h3>Step 13:</h3>
            <p>
              Write a compelling description for your even than click save and
              close.
            </p>
            <img src={image13.src} alt="write description on calendly" />

            <h3>Step 12:</h3>
            <p>Click copy link.</p>
            <img src={image14.src} alt="Click copy link" />

            <h3>Step 13:</h3>
            <p>
              Come back to urbanchat tab and paste your link in the field than
              click save.
            </p>
            <img src={image15.src} alt="enter calendly url" />
          </div>
        </div>
      </section>
    </>
  );
}
