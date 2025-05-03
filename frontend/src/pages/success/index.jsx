//==================Author Name Aayush Malviya====================================

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { getDownloadInvoice, getStripeSucess } from "@/lib/api/ApiExtra";
import toast from "react-hot-toast";


export default function Success() {
    const router = useRouter();
    const { session_id, plan_type } = router.query;



    const handleClick = () => {
        if (plan_type === 'chatbot') {
            router.push('/ai-chatbot')
        } else if(plan_type==='ai_voice') {
            router.push('/ai-assistant/ai-agents')
        }else if(plan_type==='buy_number'){
            router.push('/ai-assistant/phone')
        }
    }

    const downLoadInvoice = async () => {
        const result = await getDownloadInvoice(session_id);
        if (!result) {
            toast.error("Something Went Wrong")
        }
        window.open(result.data.Url, "_blank")

    }


    useEffect(() => {
        if (!router.isReady) return;
        const getStripe = getStripeSucess(session_id, plan_type);
    }, [router.isReady, session_id, plan_type])
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="bg-[#3e3e3e] shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-white"> Subscription Activated!</h2>
                <p className="text-white mt-3 text-lg">
                    Your subscription is now active. Start exploring the features and make the most of this!
                </p>

                <div className="flex flex-col mt-6 gap-4">
                    <button className="primary hover cursor-pointer px-5 py-3 text-white font-semibold rounded-lg bg-[#007AFF] hover:bg-[#005BBB] transition" onClick={handleClick}>
                        Get Started
                    </button>
                    <button className="px-5 py-3 text-black font-semibold bg-[#EAECEF] hover:bg-[#D5D9DE] rounded-lg transition" onClick={downLoadInvoice}>
                        🧾 Get Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}
