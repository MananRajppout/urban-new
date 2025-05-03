// import React from "react";
// import Card from "./Card";

// export default function HeroLayoutBox() {
//   const buildItems = [
//     { text: "Pre-built Templates." },
//     { text: "Pre-built Templates." },
//     { text: "Bring your LLM" },
//     { text: "Bring your LLM" },
//     { text: "Tool Calls" },
//   ];

//   const testItems = [
//     { text: "Interact with Your Agent" },
//     { text: "Check Called Tools" },
//     { text: "Save Test Cases for Future Use" },
//   ];

//   const deployItems = [
//     { text: "Web App" },
//     { text: "Mobile" },
//     { text: "Telephony: Twilio, Vonage, SIP" },
//   ];

//   const monitorItems = [
//     { text: "Sentiment Analysis" },
//     { text: "Task Completion Status" },
//     { text: "Latency Tracking" },
//   ];

//   return (
//     <div className="timeline-container" style={{ position: "relative", padding: "2rem 0" }}>
//       <div className="timeline" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        
//         <div className="timeline-step" style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "2rem" }}>
//           {/* Build Step */}
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
//             <Card id="build" title="Build" subtitle="Easily Build Complex Workflows" contentItem={buildItems} />
//           </div>
//           <div className="timeline-line" style={{ position: "absolute", top: "50%", left: "50%", width: "2px", height: "100%", backgroundColor: "#ccc", zIndex: 1 }}></div>
//         </div>
        
//         <div className="timeline-step" style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "2rem" }}>
//           {/* Test Step */}
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
//             <Card id="test" title="Test" subtitle="Comprehensive Agent Testing" contentItem={testItems} />
//           </div>
//           <div className="timeline-line" style={{ position: "absolute", top: "50%", left: "50%", width: "2px", height: "100%", backgroundColor: "#ccc", zIndex: 1 }}></div>
//         </div>

//         <div className="timeline-step" style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "2rem" }}>
//           {/* Deploy Step */}
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
//             <Card id="deploy" title="Deploy" subtitle="Deploy Anywhere" contentItem={deployItems} />
//           </div>
//           <div className="timeline-line" style={{ position: "absolute", top: "50%", left: "50%", width: "2px", height: "100%", backgroundColor: "#ccc", zIndex: 1 }}></div>
//         </div>

//         <div className="timeline-step" style={{ position: "relative", display: "flex", alignItems: "center", marginBottom: "2rem" }}>
//           {/* Monitor Step */}
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
//             <Card id="monitor" title="Monitor" subtitle="Post-Call Analysis" contentItem={monitorItems} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
