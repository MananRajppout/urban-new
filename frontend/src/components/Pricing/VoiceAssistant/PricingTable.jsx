"use client"; 

// import { useState } from 'react';
// import Image from 'next/image';
// import tick from '@/assets/Icons/tick.png';

// const tableData = [
//   {
//     headers: ["Enhanced Experience", "Basic", "Premium", "Premium+"],
//     rows: [
//       { feature: "Grok Early Access", basic: "", premium: true, premiumPlus: true },
//       { feature: "Ads in For You and Following", basic: "Full", premium: "Half", premiumPlus: "None" },
//       { feature: "Reply boost", basic: "Smallest", premium: "Larger", premiumPlus: "Largest" },
//       { feature: "Edit post", basic: true, premium: true, premiumPlus: true },
//       { feature: "Longer posts", basic: true, premium: true, premiumPlus: true },
//       { feature: "Undo post", basic: true, premium: true, premiumPlus: true },
//       { feature: "Top Articles", basic: "", premium: true, premiumPlus: true },
//       { feature: "Background video playback", basic: "", premium: "", premiumPlus: true },
//       { feature: "Download videos", basic: true, premium: true, premiumPlus: true },
//     ],
//   },
//   {
//     headers: ["Creator Hub", "Basic", "Premium", "Premium+"],
//     rows: [
//       { feature: "Write Articles", basic: true, premium: true, premiumPlus: true },
//       { feature: "Get paid to post", basic: "", premium: true, premiumPlus: true },
//       { feature: "Createo Subscriptions", basic: "", premium: true, premiumPlus: true },
//       { feature: "X Pro", basic: "", premium: true, premiumPlus: true },
//       { feature: "Media Studio", basic: "", premium: true, premiumPlus: true },
//       { feature: "Analytics", basic: "", premium: true, premiumPlus: true },
//       { feature: "Post longer videos", basic: true, premium: true, premiumPlus: true },
//     ],
//   },
//   {
//     headers: ["Verification & Security", "Basic", "Premium", "Premium+"],
//     rows: [
//       { feature: "Checkmark", basic: "", premium: true, premiumPlus: true },
//       { feature: "Optional ID verification", basic: "", premium: true, premiumPlus: true },
//       { feature: "Encrypted direct messages", basic: true, premium: true, premiumPlus: true },
//     ],
//   },
//   {
//     headers: ["Customization", "Basic", "Premium", "Premium+"],
//     rows: [
//       { feature: "Highlights tab", basic: true, premium: true, premiumPlus: true },
//       { feature: "Bookmark folders", basic: true, premium: true, premiumPlus: true },
//       { feature: "App icons", basic: true, premium: true, premiumPlus: true },
//       { feature: "Customize navigation", basic: true, premium: true, premiumPlus: true },
//     ],
//   },
// ];

// export default function PricingTable() {
//   const [data] = useState(tableData);

//   return (
//     <div className="flex flex-col justify-between min-h-screen bg-black text-white px-4 ">
//       <h2 className="text-3xl font-bold mb-8 ">Compare tiers & features</h2>
//       <div className="overflow-x-auto">
//         {data.map((section, sectionIndex) => (
//           <div key={sectionIndex} className="mb-12 w-full">
//             <table className="table-fixed w-full text-left">
//               <thead  className='w-full text-center'>
//                 <tr className="border-b border-gray-800 w-full ">
//                   {section.headers.map((header, index) => (
//                     <th key={index} className="py-4 px-6 text-base">{header}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {section.rows.map((row, rowIndex) => (
//                   <tr key={rowIndex} className="border-b border-gray-800 text-center">
//                     <td className="py-4 px-6 text-sm">{row.feature}</td>
//                     <td className="py-4 px-6 text-sm">
//                       {row.basic === true ? <Image src={tick} alt="tick" width={16} height={16} /> : row.basic}
//                     </td>
//                     <td className="py-4 px-6 text-sm">
//                       {row.premium === true ? <Image src={tick} alt="tick" width={16} height={16} /> : row.premium}
//                     </td>
//                     <td className="py-4 px-6 text-sm">
//                       {row.premiumPlus === true ? <Image src={tick} alt="tick" width={16} height={16} /> : row.premiumPlus}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }




import { useState } from 'react';
import Image from 'next/image';
import tick from '@/assets/Icons/tick.png';

const tableData = [
  {
    headers: ["Enhanced Experience", "Basic", "Premium", "Premium+"],
    rows: [
      { feature: "Grok Early Access", basic: "", premium: true, premiumPlus: true },
      { feature: "Ads in For You and Following", basic: "Full", premium: "Half", premiumPlus: "None" },
      { feature: "Reply boost", basic: "Smallest", premium: "Larger", premiumPlus: "Largest" },
      { feature: "Edit post", basic: true, premium: true, premiumPlus: true },
      { feature: "Longer posts", basic: true, premium: true, premiumPlus: true },
      { feature: "Undo post", basic: true, premium: true, premiumPlus: true },
      { feature: "Top Articles", basic: "", premium: true, premiumPlus: true },
      { feature: "Background video playback", basic: "", premium: "", premiumPlus: true },
      { feature: "Download videos", basic: true, premium: true, premiumPlus: true },
    ],
  },
  {
    headers: ["Creator Hub", "Basic", "Premium", "Premium+"],
    rows: [
      { feature: "Write Articles", basic: true, premium: true, premiumPlus: true },
      { feature: "Get paid to post", basic: "", premium: true, premiumPlus: true },
      { feature: "Createo Subscriptions", basic: "", premium: true, premiumPlus: true },
      { feature: "X Pro", basic: "", premium: true, premiumPlus: true },
      { feature: "Media Studio", basic: "", premium: true, premiumPlus: true },
      { feature: "Analytics", basic: "", premium: true, premiumPlus: true },
      { feature: "Post longer videos", basic: true, premium: true, premiumPlus: true },
    ],
  },
  {
    headers: ["Verification & Security", "Basic", "Premium", "Premium+"],
    rows: [
      { feature: "Checkmark", basic: "", premium: true, premiumPlus: true },
      { feature: "Optional ID verification", basic: "", premium: true, premiumPlus: true },
      { feature: "Encrypted direct messages", basic: true, premium: true, premiumPlus: true },
    ],
  },
  {
    headers: ["Customization", "Basic", "Premium", "Premium+"],
    rows: [
      { feature: "Highlights tab", basic: true, premium: true, premiumPlus: true },
      { feature: "Bookmark folders", basic: true, premium: true, premiumPlus: true },
      { feature: "App icons", basic: true, premium: true, premiumPlus: true },
      { feature: "Customize navigation", basic: true, premium: true, premiumPlus: true },
    ],
  },
];

export default function PricingTable() {
  const [data] = useState(tableData);

  return (
    <div className="flex flex-col justify-between min-h-screen bg-black text-white px-4">
      <h2 className="text-3xl font-bold mb-8">Compare tiers & features</h2>
      <div className="overflow-x-auto">
        {data.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-center ">
              <thead  className='w-full  '>
                <tr className="border-b border-gray-800 w-full ">
                  {section.headers.map((header, index) => (
                    <th key={index} className="w-1/4 p-4 text-base">{header}</th>
                  ))}
                </tr>
              </thead>
                <tbody>
                  {section.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-700">
                      <td className="px-4 py-2 w-1/4">{row.feature}</td>
                      <td className="px-4 py-2 w-1/4">
                        {renderCell(row.basic)}
                      </td>
                      <td className="px-4 py-2 w-1/4">
                        {renderCell(row.premium)}
                      </td>
                      <td className="px-4 py-2 w-1/4">
                        {renderCell(row.premiumPlus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderCell(value) {
  if (value === true) {
    return <Image src={tick} alt="tick" width={16} height={16} />;
  } else if (value === "") {
    return "";
  } else {
    return value;
  }
}
