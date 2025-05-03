import TrialSection from "@/components/HomePage/Trial";
import Head from "next/head";
import React from "react";

function AboutUs() {
  return (
    <>
      <Head>
        <title>
          About UrbanChat.ai: Revolutionizing AI Chatbot Solutions for
          Businesses
        </title>
        <meta
          name="description"
          content="Discover how UrbanChat.ai's AI chatbot solutions can automate customer support, boost engagement, and drive business success. Streamline operations and elevate your customer experience."
          key="desc"
        />
      </Head>
      <div className="page extra-temp">
        <div>
          <h1>
            urbanchat.ai was founded with a mission: To enable businesses
            automate customer support with AI
          </h1>
          <br />
          <br />

          <p>
            <b>
              We understand this field deeply and genuinely—it's where we come
              from.
            </b>
          </p>
          <br />
          <p>
            Our engagement with this sector stems from genuine experience and
            expertise. Our team has a solid foundation in this industry,
            providing us with a unique perspective and deep understanding. This
            is more than just a business venture for us; it's a commitment to
            excellence and innovation based on real-world insights. Our roots in
            this field ensure that our approach is both authentic and
            professional.
          </p>
          <p>
            Our technology is developed entirely in-house, tailored by direct
            feedback and requests from our users. This flexibility allows us to
            quickly adapt and fulfill your needs in ways that others, lacking
            their own engineering teams, cannot. With countless hours invested
            in collaborating with various businesses we've gained deep insights
            into what truly drives their success and how our solutions can
            contribute.
          </p>
          <br />
          <br />
          <br />
        </div>
      </div>
      <TrialSection />
    </>
  );
}

export default AboutUs;
