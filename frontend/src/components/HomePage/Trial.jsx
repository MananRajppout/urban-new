// import React, { useEffect, useRef } from "react";
// import "@/styles/HomePage/trial.css";
// import Link from "next/link";

// export default function TrialSection() {
//   return (
//     <section className="trial-section">
//       <div className="page">
//         <div className="trial">
//           <h2>Join the future of Ai Chatbots</h2>
//           {/* <p>
//             Get a hands-on experience with Robot Reply before committing to a
//             plan.
//           </p> */}
//           <Link href="/my-chatbot/create">
//             <button className="hover primary">Create your chatbot</button>
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }
import React from "react";
// import { cn } from "@/lib/utils";
import Image from "next/image";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import Link from "next/link";
import { Globe } from "../Glob";
import '../../styles/Trial/Trial.css'

export default function TrialSection() {
  const feature = {
      title: "Deploy in seconds",
      description:
        "With our blazing fast, state of the art, cutting edge, we are so back cloud servies (read AWS) - you can deploy your model in seconds.",
      skeleton: <SkeletonOne />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    };
  return (
    (
      <section className=" page">
        <div className="z-20 w-full mx-auto">
          <div
            className="grid grid-cols-1 mt-12  mx-auto  rounded-xl" >
              <FeatureCard key={feature.title} className={feature.className}>
                <div>
                  <h2 className="primary-heading mt-14 text-start">Build an AI Voice Agent for Your Business</h2>
                  <h5 className="subtitle text-start">Let Urbanchat connect to your software live on call so that it can schedule appointments or take payments or handle product returns just like a human.</h5>
                  <Link href="/ai-assistant/ai-agents">
                    <button className="primary outline hover cursor-pointer">Build your AI voice agent</button>
                  </Link>
                </div>
                <div className=" h-full w-full">{feature.skeleton}</div>
              </FeatureCard>
          </div>
      </div>
    </section>)
  );
}

const FeatureCard = ({
  children,
  className
}) => {
  return (
    (<div className={`p-4 sm:p-10 h-[1200px] md:h-[600px] md:flex overflow-hidden ${className}`}>
      {children}
    </div>)
  );
};


export const SkeletonOne = () => {
  return (
    (<div
      className="globe-parent">
      <Globe className="globe"/>
    </div>)
  );
};




// (<div
//   className="globe-parent h-60 md:h-60  flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
//   <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72 globe" />
// </div>)
