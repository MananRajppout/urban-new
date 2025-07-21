'use client'
import { generateLivekitToken } from "@/lib/api/ApiAiAssistant";
import { useState, useEffect, useMemo } from "react";
import { nanoid } from "nanoid";



const useConnect = (agentId) => {
    const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    const [token, setToken] = useState(null);
    const [identity, setIdentity] = useState(null);
    const [wsUrl, setWsUrl] = useState(LIVEKIT_URL);
    const [loading, setLoading] = useState(true);
   
   
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const formdata = {
                    metadata: {
                        agentId: agentId,
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
