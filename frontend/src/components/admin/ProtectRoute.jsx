'use client'
import { getUserDetail } from '@/lib/api/ApiExtra';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const ProtectRoute = ({children}) => {
    const [loading,setLoading] = useState(false);
    const router = useRouter()
    const fetchUser = async () => {
        setLoading(true)
        try {
            const res = await getUserDetail();
            // if(res.data.user?.email != "urbanchatai@gmail.com"){
            //     router.push("/")
            // }
        } catch (error) {
            router.push("/")
        }finally{
            setLoading(false)
        }
    }
  useEffect(() => {
    fetchUser()
  },[])
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