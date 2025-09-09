'use client'
import { getUserDetail } from '@/lib/api/ApiExtra';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const extractSubdomain = () => {
    try {
        const hostname = window.location.hostname
        const parts = hostname.split('.');


        
        if(hostname == process.env.NEXT_PUBLIC_MAIN_DOMAIN){
            return {
                type: "subdomain",
                name:  "main"
            }
        }
        
        const length = process.env.NEXT_PUBLIC_NODE_ENV == "development" ? 1 : 2;``
        if (parts.length > length) {
            const subdomain = parts[0];
            return {
                type: "subdomain",
                name:  subdomain
            }
        }

        const custom_domain = hostname;
        return {
            type: "domain",
            name: custom_domain
        }
    } catch (error) {
        console.error("Invalid URL:", error.message);
        return null;
    }
}


const ProtectRoute = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const fetchUser = async () => {
        setLoading(true)
        try {
            const res = await getUserDetail();
            const details = extractSubdomain();
            const user = res.data.user;
            console.log(user,details)
            if(details.type == "subdomain"){
                
                if(user.slug_name == details.name && (user.role == "admin" || user.role == "super-admin")){
                
                    return true;
                }else{
                    router.push("/");
                }
            }else{
                if(user.custom_domain == details.name && (user.role == "admin" || user.role == "super-admin")){
                    
                    return true;
                }else{
                    router.push("/");
                }
            }
        } catch (error) {
            router.push("/")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchUser()
    }, [])
    return (

        <>
            {
                loading ? <div className='h-[96vh] w-[96vw] flex items-center justify-center'>
                    <Loader2 className='text-green-500 animate-spin' size={50} />
                </div> : <>{children}</>
            }
        </>
    )
}

export default ProtectRoute