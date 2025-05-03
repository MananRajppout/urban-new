// import React, { useState } from "react";

// const HorizontalLine = () => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const tags = ["Build", "Test", "Deploy", "Monitor"];
//   const sections = ["#build", "#test", "#deploy", "#monitor"]; // Match with your section IDs

//   const handleClick = (index) => {
//     setActiveIndex(index);

//     // Smooth scroll to the section based on the index
//     const section = document.querySelector(sections[index]);
//     if (section) {
//       section.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
//   }
  
    
//   };

//   return (
//     <div className="" style={{ overflow: "hidden", width: "98.5%" }}>
//       {/* Tag Container */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           padding: "10px 0",
//           position: "relative",
          
//         }}
//       >
//         {tags.map((tag, index) => (
//           <a
//             key={index}
//             href={sections[index]}
//             onClick={(e) => {
//               e.preventDefault(); // Prevent default scrolling behavior
//               handleClick(index);
//             }}
//             style={{
              
//               padding: "10px 15px",
//               margin: "0 5px",
//               textAlign: "center",
//               borderRadius: "8px",
//               fontWeight: activeIndex === index ? "bold" : "normal",
//               fontSize: "1rem",
//               color: activeIndex === index ? "rgb(14, 18, 23)" : "rgb(255, 255, 255)",
//               backgroundColor: activeIndex === index ? "rgb(255, 255, 255)" : "gray",
//               boxShadow: activeIndex === index ? "0px 4px 10px rgba(255, 255, 255, 0.3)" : "none",
//               transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)", // Smooth bounce-like easing
//               cursor: "pointer",
//               textDecoration: "none", // Removes underline
//             }}
//           >
//             {tag}
//           </a>
//         ))}
//       </div>
//       {/* Animated Trickle */}
//       <div
//         className="trickle"
//         style={{
//           position: "relative",
//           height: "4px",
//           backgroundColor: "rgba(255, 255, 255, 0.2)",
//           marginTop: "10px",
//           width: "100%",
//           borderRadius: "4px",
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             height: "4px",
//             backgroundColor: "rgb(255, 255, 255)",
//             width: `${(activeIndex + 1) * 25}%`,
//             transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth easing for progress
//             boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)", // Glow effect
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default HorizontalLine;
