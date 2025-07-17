'use client'
import { generateLivekitToken } from "@/lib/api/ApiAiAssistant";
import { useState, useEffect, useMemo } from "react";
import { nanoid } from "nanoid";
import { useApp } from "@/context/AppContext";



const useConnect = () => {
    const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    const [token, setToken] = useState(null);
    const [identity, setIdentity] = useState(null);
    const [wsUrl, setWsUrl] = useState(LIVEKIT_URL);
    const [loading, setLoading] = useState(true);
    const {websiteSettings} = useApp();
   
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const formdata = {
                    metadata: {
                        agentId: websiteSettings.live_demo_agent || process.env.NEXT_PUBLIC_DEMO_AGENT_ID,
                        callId: nanoid(20),
                        callType: "web",
                        dir: ""
                    }
                }
                const res = await generateLivekitToken(formdata)
                setToken(res.data.accessToken);
                setIdentity(res.data.identity);
            } catch (error) {
                console.error("Error fetching token:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchToken();
    }, []);

    return { token, wsUrl, loading, identity };
};

export default useConnect;
