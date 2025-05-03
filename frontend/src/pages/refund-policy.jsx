import Head from "next/head";
import React from "react";

function RefundPolicy() {
  return (
    <div className="page extra-temp">
      <Head>
        <title>UrbanChat.ai Refund Policy - Your Guide to Our Refund Terms</title>
        <meta
          name="description"
          content="Understand the refund policy governing the use of UrbanChat.ai's AI chatbot platform. Ensure compliance with the refund terms to effectively leverage the powerful customer engagement."
          key="desc"
        />
      </Head>
      <h1>Refund Policy: Ensuring a Fair and Transparent Experience</h1>
      <p>Last Updated: 6th March, 2025</p>
      <ol>
        <li>
          No Refunds After Service Usage
          <p>
            Once a customer has used the AI voice agent, chatbot, or any other service, refunds will not be issued. This includes call minutes, AI responses, integrations, or any usage-based features.
          </p>
        </li>
        <li>
          Partial Refunds (Exceptional Cases Only)
          <p>
            If a technical issue on our end prevents service usage, a partial refund or credit may be issued at our discretion. Refund requests must be made within 7 days of purchase with proof of the issue.
          </p>
        </li>
        <li>
          Subscription & Recurring Payments
          <p>
            Customers can cancel their subscription at any time, but refunds will not be provided for the remaining billing cycle. If an accidental charge occurs, a refund request must be submitted within 48 hours.
          </p>
        </li>
        <li>
          Refund Eligibility
          <p>
            A refund may be considered under these conditions:
          </p>
          <ul className="list-disc ml-6">
            <li>Payment was charged twice due to a billing error.</li>
            <li>Service was completely unavailable due to an error on our part.</li>
            <li>Customer was charged after canceling their subscription.</li>
          </ul>
        </li>
        <li>
          How to Request a Refund
          <p>
            If you believe you qualify for a refund, please contact our support team at <a href="mailto:support@urbanchat.ai" className="text-blue-500 underline">support@urbanchat.ai</a>  with:
          </p>
          <ul className="list-disc ml-6">
            <li>Your account details</li>
            <li>Reason for the refund request</li>
            <li>Any relevant proof (screenshots, error logs, etc.)</li>
          </ul>
          <p>
            All refund requests are reviewed within 5-7 business days, and decisions are final.
          </p>
        </li>
      </ol>
    </div>
  );
}

export default RefundPolicy;