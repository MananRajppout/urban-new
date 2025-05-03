import React from "react";

// import '@/styles/page.css'
import "@/styles/integration-page.css";
import image1 from "@/assets/whatsapp-integration/image1.png";
import image2 from "@/assets/whatsapp-integration/image2.png";
import image3 from "@/assets/whatsapp-integration/image3.png";
import image4 from "@/assets/whatsapp-integration/image4.png";
import image5 from "@/assets/whatsapp-integration/image5.png";
import image6 from "@/assets/whatsapp-integration/image6.png";
import image7 from "@/assets/whatsapp-integration/image7.png";
import image8 from "@/assets/whatsapp-integration/image8.png";
import image9 from "@/assets/whatsapp-integration/image9.png";
import image10 from "@/assets/whatsapp-integration/app_setting.png";
import image11 from "@/assets/whatsapp-integration/privacy_url.png";
import image12 from "@/assets/whatsapp-integration/image12.png";
import image13 from "@/assets/whatsapp-integration/image13.png";
import image14 from "@/assets/whatsapp-integration/image14.png";
import image15 from "@/assets/whatsapp-integration/image15.png";
import image16 from "@/assets/whatsapp-integration/image16.png";
import image17 from "@/assets/whatsapp-integration/image17.png";
import image18 from "@/assets/whatsapp-integration/image18.png";
import image19 from "@/assets/whatsapp-integration/image19.png";
import image20 from "@/assets/whatsapp-integration/image20.png";
import image21 from "@/assets/whatsapp-integration/permanent-token.png";
import image22 from "@/assets/whatsapp-integration/whatsapp_api_setup.png";
import image23 from "@/assets/whatsapp-integration/image22.png";
import image24 from "@/assets/whatsapp-integration/image23.png";
import image25 from "@/assets/whatsapp-integration/image24.png";
import image26 from "@/assets/whatsapp-integration/image25.png";
import image27 from "@/assets/whatsapp-integration/image26.png";
import image28 from "@/assets/whatsapp-integration/image27.png";
import image29 from "@/assets/whatsapp-integration/configuration.png";
import image30 from "@/assets/whatsapp-integration/webhook_field.png";
import image31 from "@/assets/whatsapp-integration/image31.png";
import image32 from "@/assets/whatsapp-integration/image32.png";
import image33 from "@/assets/whatsapp-integration/image33.png";

import callbackfirstImage from "@/assets/whatsapp-integration/copy_callback_url_first.png";
import callbacksecondImage from "@/assets/whatsapp-integration/copy_callback.png";
import addDetails from "@/assets/whatsapp-integration/add_details.png";
import finalImage from "@/assets/whatsapp-integration/final_image.png";

import callbackImage from "@/assets/whatsapp-integration/callback_url.png";
import privacyImage from "@/assets/whatsapp-integration/privacy.png";
import manageImage from "@/assets/whatsapp-integration/manage.png";
import whatsappIntegrateImage from "@/assets/whatsapp-integration/whatsapp_integrate.png";
import whatsappIntegrateImage2 from "@/assets/whatsapp-integration/whatsapp_second_page.png";
import Head from "next/head";

export default function WhatsAppIntegration() {
  return (
    <>
      <Head>
        <title>Whatsapp integration</title>
        <meta
          name="description"
          content="Seamlessly integrate your AI chatbot with WhatsApp and let it engage with your customers 24/7. Discover how to set up your AI-powered chatbot with WhatsApp and unlock the benefits of AI in customer service."
          key="desc"
        />
      </Head>
      <section className="integration-page">
        <div className="page">
          <h1>Integrating Urbanchat with WhatsApp</h1>
          <p>
            By integrating Urbanchat with WhatsApp, you can significantly
            improve your customer support quality by allowing your custom-built
            chatbot to seamlessly assist your customers/clients at any time.
          </p>
          <p>This guide will take you through the integration process.</p>

          <h3>Step 1: Getting Started with WhatsApp Integration</h3>
          <ol>
            <li>
              <p>Sign in to Urbanchat and Create Your Bot:</p>
              <ul>
                <li>
                  Make sure you have access to your Urbanchat account. If you
                  don't have one, create an account.
                </li>
                <li>
                  Set up your bot by uploading files, text, websites, or Q&As.
                </li>
              </ul>
            </li>

            <li>
              <p>Find the WhatsApp Integration Option</p>
              <ul>
                <li>Navigate to your chatbot menu.</li>
                <li>Click on the "Integrations" tab.</li>
                <li>
                  Select "Add to WhatsApp" to initiate the integration process.
                </li>
                <li>
                  Follow the displayed steps to connect your WhatsApp business
                  account to Urbanchat.
                </li>
              </ul>
            </li>
          </ol>

          <h3>Step 2: Setting Up Meta (Facebook) Business Account and App</h3>
          <ol>
            <li>
              <p>Create a Meta (Facebook) Business Account:</p>
              <ul>
                <li>
                  Visit <a href="#">here</a>
                </li>
                <li>
                  Enter your business name, your name, and work email address.
                  Click "Next".
                </li>
                <li>Provide your business details and click "Submit".</li>
                <li>Enter your business details and click Submit</li>
                <li className="image">
                  <img src={image1.src} />
                </li>
              </ul>
            </li>
            <li>
              <p>
                Create a new Meta (Facebook) App at
                https://developers.facebook.com/.
              </p>
              <ul>
                <li>
                  "<b>Log in</b>" to your Meta (Facebook) Developer Account
                </li>
                <li className="image">
                  {" "}
                  <img src={image2.src} />
                </li>

                <li>
                  Select "<b>My Apps</b>"
                </li>
                <li className="image">
                  <img src={image3.src} />
                </li>

                <li>
                  Click "<b>Create App</b>"
                </li>
                <li className="image">
                  <img src={image4.src} />
                </li>

                <li>
                  Choose User Case: "<b>Other</b>" and click "Next".
                </li>
                <li className="image">
                  <img src={image5.src} />
                </li>

                <li>
                  Choose App Type: "<b>Business</b>" and click "Next".
                </li>
                <li className="image">
                  <img src={image6.src} />
                </li>

                <li>
                  Provide app details: App Name, App Contact Email, Business
                  Account (Optional), and click "Create app".
                </li>
                <li className="image">
                  <img src={image7.src} />
                </li>
              </ul>
            </li>
          </ol>

          <h3>
            Step 3: Setting Up Meta (Facebook) App for WhatsApp Integration
          </h3>
          <ol>
            <li>
              <p>Add WhatsApp to your Meta (Facebook) App.</p>
              <ul>
                <li>
                  In the "<b>Developers Dashboard</b>", choose your app.
                </li>
                <li>
                  Locate "<b>Add products to your app</b>" in your app's
                  dashboard tab.
                </li>
                <li className="image">
                  <img src={image8.src} />
                </li>

                <li>
                  Choose "<b>WhatsApp</b>" for setup.
                </li>
                <li className="image">
                  <img src={image9.src} />
                </li>

                <li>
                  Select your Meta (Facebook) Business Account (if not selected
                  in step 2).
                </li>
                <li>
                  Navigate to <b>App settings {">"} Basic</b> from the sidebar.
                </li>
                <li className="image">
                  <img src={image10.src} />
                </li>
                <li>
                  Set the <b>Privacy Policy URL</b> to{" "}
                  <a href="https://www.urbanchat.ai/privacy">
                    https://www.urbanchat.ai/privacy.
                  </a>
                </li>
                <li className="image">
                  <img src={image11.src} />
                </li>
                <li>Save changes.</li>
                <li>Set App Mode to Live.</li>
                <li className="image">
                  <img src={image12.src} />
                </li>
              </ul>
            </li>
          </ol>

          <h3>Step 4: Generate WhatsApp Token</h3>
          <p>
            To obtain a permanent WhatsApp Access Token, follow 1 to 3 steps:
          </p>
          <ol>
            <li>
              <p>Create a "System User":</p>
              <ul>
                <li>Visit the Meta Business Suite.</li>
                <li>
                  Find your business account in the top-left dropdown menu and
                  click its Settings (gear) icon.
                </li>
                <li>Click Business Settings.</li>
                <li className="image">
                  <img src={image13.src} />
                </li>

                <li>Go to Users {">"} System users.</li>
                <li className="image">
                  <img src={image14.src} />
                </li>

                <li>Add an Admin system user.</li>
                <li className="image">
                  <img src={image15.src} />
                </li>
              </ul>
            </li>
            <li>
              <p>Add Assets.</p>
              <ul>
                <li>After creating the system user, click on Add Assets.</li>
                <li className="image">
                  <img src={image16.src} />
                </li>

                <li>Navigate to Apps {">"} "Your app name".</li>
                <li>
                  Select your app and grant full control to manage the app.
                </li>
                <li className="image">
                  <img src={image17.src} />
                </li>
              </ul>
            </li>
            <li>
              <p>Generate System User Access Tokens.</p>
              <ul>
                <li>Click the Generate New Token button on the system user.</li>
                <li className="image">
                  <img src={image18.src} />
                </li>

                <li>
                  Choose the app that will use the token and set the token
                  expiration to never.
                </li>
                <li className="image">
                  <img src={image19.src} />
                </li>

                <li>
                  Select "whatsapp_business_messaging" and
                  "whatsapp_business_management" permissions.
                </li>
                <li className="image">
                  <img src={image20.src} />
                </li>

                <li>Generate the token.</li>
                <li>Copy the access token and store it securely.</li>
                <li className="image">
                  <img src={image21.src} />
                </li>
              </ul>
            </li>

            <li>
              <p>Add a new Business Number for WhatsApp</p>
              <ul>
                <li>
                  You can use your own business number or utilize the provided
                  test number for your WhatsApp chatbot.
                </li>
                <li>
                  In WhatsApp Developer Dashboard, navigate to WhatsApp {">"}{" "}
                  API Setup from the sidebar.
                </li>
                <li className="image">
                  <img src={image22.src} />
                </li>

                <li>
                  Proceed to "Step 5: Add a Phone Number," click Add phone
                  number.
                </li>
                <li className="image">
                  <img src={image23.src} />
                </li>

                <li>Provide details required in the following form.</li>
                <li className="image">
                  <img src={image24.src} />
                </li>

                <li>Verify your number using the received code.</li>
                <li>
                  Once successfully added, select your phone number in Step 1 of
                  API Setup.
                </li>
                <li className="image">
                  <img src={image25.src} />
                </li>
              </ul>
            </li>

            <li>
              <p>Add a Payment Method</p>
              <ul>
                <li>
                  To send messages via WhatsApp, you need a valid payment
                  method. Visit here for details.
                </li>
                <li>
                  After adding your business phone number, click "Add payment
                  method" to address the "Missing valid payment method" alert.
                </li>
                <li className="image">
                  <img src={image26.src} />
                </li>

                <li>
                  You'll be directed to your WhatsApp account settings. Click
                  "Payment Methods" {">"} "Add business payment method" and
                  follow the prompts to add your card info.
                </li>
                <li className="image">
                  <img src={image27.src} />
                </li>
              </ul>
            </li>

            <li>
              <p>Test your new Business Number for WhatsApp</p>
              <ul>
                <li>
                  Return to WhatsApp Developer Dashboard, navigate to API Setup{" "}
                  {">"} Step 1.
                </li>
                <li>Enter a testing "To" number.</li>
                <li>
                  Click "Send message" to verify successful message delivery.
                </li>
                <li className="image">
                  <img src={image28.src} />
                </li>
              </ul>
            </li>
          </ol>

          <h3>Step 5: Configure WhatsApp API Webhook settings</h3>
          <ol>
            <li>
              <p>Verify WhatsApp Webhook Callback.</p>
              <ul>
                <li>
                  In WhatsApp Developer Dashboard, navigate to Configuration.
                </li>
                <li>Under Webhook, click edit</li>
                <li className="image">
                  <img src={image29.src} />
                </li>
                <li>
                  Copy the Callback URL and Verification Token from Urbanchat
                  WhatsApp Integration modal to your WhatsApp Developer
                  Dashboard.
                </li>
                <li className="image">
                  <img src={callbackfirstImage.src} />
                </li>
                <li className="image">
                  <img src={callbacksecondImage.src} />
                </li>
                <li>Click Verify and Save to save the webhook.</li>
              </ul>
            </li>
            <li>
              <p>Configure Webhook Subscription Field</p>
              <ul>
                <li>Under "Webhook Fields," click Manage.</li>
                <li className="image">
                  <img src={image30.src} />
                </li>

                <li>
                  Find the "messages" field and subscribe to it by checking the
                  box.
                </li>
                <li className="image">
                  <img src={image31.src} />
                </li>

                <li>Return to Urbanchat and click Verify.</li>
                <li className="image">
                  <img src={whatsappIntegrateImage.src} />
                </li>
              </ul>
            </li>
          </ol>

          <h3>Step 6: Add WhatsApp Account to your Urbanchat Chatbot</h3>
          <ol>
            <li>
              <p>Retrieve WhatsApp Account Information</p>
              <ul>
                {/* <li>In WhatsApp Developer Dashboard, navigate to App Settings {">"} Basic</li>
                        <li>Copy App secret and paste it in chatbase integration modal in Facebook App Secret</li>
                        <li className="image"><img src={image32.src} /></li> */}

                <li>
                  Paste the permanent access token generated from Step 4.3 in
                  urbanchat integration modal in WhatsApp Access Token.
                </li>
                <li className="image">
                  <img src={whatsappIntegrateImage2.src} />
                </li>

                <li>
                  Copy your Phone Number, Phone Number ID, and WhatsApp Business
                  Account ID into the Urbanchat WhatsApp Integration modal.
                </li>
                <li className="image">
                  <img src={image33.src} />
                </li>

                <li>Click Add Account to complete integration.</li>
                <li className="image">
                  <img src={addDetails.src} />
                </li>
              </ul>
            </li>
          </ol>

          <h3>Step 7: Confirm Integration Completion</h3>
          <p>
            Congratulations! Your chatbot is now ready to assist clients via
            your WhatsApp number.
          </p>
          <p>
            You can enable, disable, edit, or delete your WhatsApp integration
            settings as needed.
          </p>
          <div>
            <img src={finalImage.src} />
          </div>
        </div>
      </section>
    </>
  );
}
