import { useEffect, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';

import DateRangeFilter from '@/components/billing/DateRangeFilter';
import CurrentPlanCard from '@/components/billing/CurrentPlanCard';
import NextPaymentCard from '@/components/billing/NextPaymentCard';
import InvoicesTab from '@/components/billing/InvoicesTab';
import PaymentMethodsTab from '@/components/billing/PaymentMethodsTab';


import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import BillingHistory from '@/components/billing/BillingHistory';
import { getCurrentPlanDetails } from '@/lib/api/ApiExtra';
import { fetchPhoneNumbers } from '@/lib/api/ApiAiAssistant';
import UserBalanceCard from '@/components/billing/UserBalanceCard';

const Billing2 = () => {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
    const [phoneNumbers,setPhonenumbers]=useState([]);
    const [nextpaymentData,setnextpaymentData]=useState([]);
  
    const [currentPlan, setCurrentPlan] = useState(null);
    const [currentAiPlan,setCurrentAiPlan] = useState(null);
  
    useEffect(() => {
      const fetchCurrentPlan = async () => {
        try {
    
          const response = await getCurrentPlanDetails();
      
     
          if (response.data) {
            console.log(response.data)
            setCurrentPlan(response.data.pricingPlan);
            setCurrentAiPlan(response.data.aiPricingPlan);
          }
        } catch (error) {
          console.error("Error fetching current plan:", error);
        }
      };
  
      fetchCurrentPlan();
   

    }, []);

    
        async function getBoughtPhoneNumber() {
          const res = await fetchPhoneNumbers();
          if (res.data) {
            const respondedNumbers = res?.data?.numbers;
            setPhonenumbers(respondedNumbers);
        
          } else {
            toast.error("Failed to fetch agents");
          }
        }
    
  


useEffect(()=>{
  getBoughtPhoneNumber()
},[])

function mergePlanAndPhoneData(currentAiPlan, phoneNumbers) {
  const finalArray = [];

  // Add Voice Plan Info First
  if (currentAiPlan) {
    finalArray.push({
      name: currentAiPlan?.name || "AI Voice Plan",
      next_payment: currentAiPlan&&currentAiPlan?.next_payment&&format(parseISO(currentAiPlan.next_payment), 'MMM dd, yyyy') || null,
      cost: currentAiPlan.cost || 0,
      currency:currentAiPlan.currency
    });
  }

  // Add Phone Number Details
  if (Array.isArray(phoneNumbers)) {
    phoneNumbers?.forEach(phone => {
      finalArray.push({
        name: "Phone Number",
        next_payment:format(parseISO(phone.renewal_date), 'MMM dd, yyyy') || null,
        cost: Number(phone.monthly_rental_fee) || 0,
        currency:phone.currency
      });
    });
  }

  finalArray?.sort((a, b) => {
    const dateA = new Date(a.next_payment);
    const dateB = new Date(b.next_payment);
    return dateA - dateB;
  });

  setnextpaymentData(finalArray);
}


useEffect(()=>{
  mergePlanAndPhoneData(currentAiPlan,phoneNumbers)
},[phoneNumbers,currentAiPlan])
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-xl font-medium text-white">Billing & Payments</h1>
          <DateRangeFilter 
            dateRange={dateRange}
            setDateRange={setDateRange}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="h-full w-full">
    <CurrentPlanCard plan={currentAiPlan} />
  </div>
  <div className="h-full w-full">
    <NextPaymentCard plan={nextpaymentData} />
  </div>
  <div >
   <UserBalanceCard/>
  </div>
</div>


        <div className="glass-panel p-4 rounded-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-glass-panel-light/30 w-full justify-start mb-4 overflow-x-auto">
              <TabsTrigger value="transactions" className="data-[state=active]:bg-accent-teal data-[state=active]:text-black ml-0.5">
                Transaction History
              </TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-accent-teal data-[state=active]:text-black ml-0.5">
                Invoices
              </TabsTrigger>
              <TabsTrigger value="payment-methods" className="data-[state=active]:bg-accent-teal data-[state=active]:text-black ml-0.5">
                Payment Methods
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              <BillingHistory dateRange={dateRange} filterOpen={filterOpen} />
            </TabsContent>

            <TabsContent value="invoices">
              <InvoicesTab   dateRange={dateRange} filterOpen={filterOpen}/>
            </TabsContent>

            <TabsContent value="payment-methods">
              <PaymentMethodsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
    
  );
};

export default Billing2;




















//old code here ///


// import { useEffect, useState } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
// import "@/styles/AiAssistant/billing.css"; // Assuming you have a CSS file for the page
// import { AddCreditCardDialog } from "@/components/Dialog/AddCreditCardDialog";
// import { FaReceipt } from "react-icons/fa";
// import { useRouter } from "next/router";
// import toast from "react-hot-toast";
// import Layout from "@/components/layout/Layout";
// import { getPaymentMethod,deletePaymentMethod } from "@/lib/api/ApiBilling";

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// const AddCreditCard = () => {
//   const [showDialog, setShowDialog] = useState(false);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [activeTab, setActiveTab] = useState("paymentMethods");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleOpenDialog = () => setShowDialog(true);
//   const handleCloseDialog = () => setShowDialog(false);

//   const fetchPaymentMethods = async () => {
//     setLoading(true);
//     try {
//       const response = await getPaymentMethod();
//       if (response?.data?.success) {
//         setPaymentMethods(response.data.payment_methods);
//       }
//     } catch (error) {
//       console.error("Failed to fetch payment methods", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteCard = async (cardId) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this card?"
//     );
//     if (!confirmed) return;

//     try {
//       const response = await deletePaymentMethod(cardId);
//       if (response?.data?.success) {
//         fetchPaymentMethods();
//         toast.success(response.data.message);
//       } else {
//         toast.error("Failed to delete payment method");
//       }
//     } catch (error) {
//       console.error("Error deleting payment method", error);
//       toast.error("An error occurred while deleting the payment method.");
//     }
//   };

//   const billingHistory = []; // Sample data

//   useEffect(() => {
//     fetchPaymentMethods();
//     if (router.query.showDialog) {
//       setShowDialog(true);
//     }
//   }, [router.query.showDialog]);

//   return (
//     <Layout>
//       <div className="fade-background h-[85vh] p-4 overflow-y-auto">
//         <h1 className="text-3xl font-bold pb-5">Billing</h1>

//         {/* Tabs Navigation */}
//         <div className="tabs" role="tablist" aria-label="Billing Tabs">
//           <button
//             role="tab"
//             tabIndex={0}
//             className={`tab ${activeTab === "paymentMethods" ? "active" : ""}`}
//             aria-selected={activeTab === "paymentMethods"}
//             onClick={() => setActiveTab("paymentMethods")}
//           >
//             Payment Methods
//           </button>
//           <button
//             role="tab"
//             tabIndex={0}
//             className={`tab ${activeTab === "billingHistory" ? "active" : ""}`}
//             aria-selected={activeTab === "billingHistory"}
//             onClick={() => setActiveTab("billingHistory")}
//           >
//             Billing History
//           </button>
//         </div>

        

//         {/* Tab Content */}
//         <div className="tab-content">
//           {activeTab === "billingHistory" && (
//             <div className="p-3">
//               {billingHistory.length > 0 ? (
//                 <table
//                   className="min-w-full shadow-lg text-center overflow-hidden glassy-table"
//                   style={{ backgroundColor: "var(--color-surface2)" }}
//                 >
//                   <thead style={{ backgroundColor: "var(--color-surface3)" }}>
//                     <tr>
//                       <th className="py-3 px-4 font-medium">DATE</th>
//                       <th className="py-3 px-4 font-medium">COST</th>
//                       <th className="py-3 px-4 font-medium">MINUTES</th>
//                       <th className="py-3 px-4 font-medium">STATUS</th>
//                       <th className="py-3 px-4 font-medium">RECEIPT</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {billingHistory.map((history, index) => (
//                       <tr key={index} className="text-center">
//                         <td className="py-3 px-4">{history.date}</td>
//                         <td className="py-3 px-4">{history.cost}</td>
//                         <td className="py-3 px-4">{history.minutes}</td>
//                         <td className="py-3 px-4">{history.status}</td>
//                         <td className="py-3 px-4">
//                           <a
//                             href={history.receiptUrl}
//                             download
//                             className="text-color-primary cursor-pointer underline flex items-center justify-center"
//                           >
//                             <FaReceipt className="mr-2" />
//                           </a>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <div
//                   className="text-center py-4"
//                   style={{ color: "var(--color-on-surface2)" }}
//                 >
//                   No billing history available.
//                 </div>
//               )}
//             </div>
//           )}



//           {activeTab === "paymentMethods" && (
//             <div>
//               {loading ? (
//                 <div className="spinner">Loading...</div>
//               ) : paymentMethods.length > 0 ? (
//                 <div className="grid mb-4 mt-5 gap-6 grid-cols-1">
//                   {paymentMethods.map((method, index) => (
//                     <div key={method._id} className="flip-card">
//                       <div className="flip-card-inner rounded-2xl shadow-lg">
//                         <div className="flip-card-front p-4 relative text-white">
//                           {index === 0 && (
//                             <span className="bg-yellow-300 text-gray-800 py-1 px-3 rounded-full text-xs font-semibold absolute top-4 left-4">
//                               Default
//                             </span>
//                           )}
//                           <p className="number text-xl font-semibold tracking-widest mb-10 absolute bottom-16 left-6">
//                             **** **** **** {method.last4_card_number}
//                           </p>
//                           <p className="valid_thru text-xs absolute bottom-12 left-6 font-medium tracking-wide">
//                             VALID THRU
//                           </p>
//                           <p className="date_8264 text-xl absolute bottom-4 left-7">
//                             {method.expiry_month.toString().padStart(2, "0")}/
//                             {method.expiry_year.toString().slice(-2)}
//                           </p>
//                         </div>
//                         <div className="flip-card-back p-4 relative text-white">
//                           <span
//                             className="card-delete-btn"
//                             onClick={() => handleDeleteCard(method._id)}
//                           >
//                             &times;
//                           </span>
//                           <div className="strip"></div>
//                           <div className="back-content flex justify-between mt-6 px-4">
//                             <div className="signature-box"></div>
//                             <div className="cvv-box">***</div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className=" flex flex-col items-center  mt-40">
//                   <p>No payment methods available.</p>
//                   <button onClick={handleOpenDialog} className="outline-btn">
//                     + Add Payment Method
//                   </button>
//                 </div>
//               )}


          
//             </div>
//           )}
//         </div>
//       </div>



    
//     </Layout>
//   );
// };

// export default AddCreditCard;
