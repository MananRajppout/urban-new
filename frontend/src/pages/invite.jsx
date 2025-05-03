
import React, { useState, useRef } from 'react'
import main_logo from "../assets/main_logo.png";
import formMobile from "../assets/formMobile.png"
import Head from "next/head";
import "../styles/invite-page.css"
import { addInvite } from '../lib/api/ApiExtra';
import toast from 'react-hot-toast';

export default function Invite() {

    const [isProcess, setIsProcess] = useState(false)
    const formData = useRef({
        first: "", last: "", email: "", phone: "", about: ""
    })

    async function onSubmit(event) {
        event.preventDefault()

        const target = event.target

        if (isProcess) return

        setIsProcess(true)
        const res = await addInvite(formData.current.first, formData.current.last, formData.current.email, formData.current.phone, formData.current.about)
        if (res.data) {
            toast.success("Invite submitted successfully")
            target.reset()
        } else {
            toast.error(res.message)
        }

        setIsProcess(false)
    }
    return (
        <>
        <Head>
        <title>Invite Your Team to UrbanChat.ai - Streamline Customer Support with AI</title>
        <meta
          name="description"
          content="Invite your team to UrbanChat.ai and unlock the power of AI chatbots to streamline customer support, boost engagement, and drive business success. Collaborate seamlessly, share insights, and optimize performance with our intuitive platform."
          key="desc"
        />
      </Head>
        
        <div className="invite-page">
            <div className='page'>
                <h2>Refer Friends, Earn Rewards, and Elevate Customer Experience</h2>
                <p>Join Friends of UrbanChat.ai and receive a 20% commission on all payments within the first 12 months for paying customers you refer to</p>
                <div className='form-holder'>
                    <div className='title'>
                        <img src={main_logo.src} />
                    </div>
                    <form onSubmit={onSubmit}>
                        <h3>Your Friend Details</h3>
                        <div className='inner'>
                            <div>
                                <p className="input-title">First Name</p>
                                <input onChange={(e) => formData.current.first = e.target.value} name='first'
                                    type="text"
                                    placeholder="First name"
                                    required
                                />

                                <p className="input-title">Last Name</p>
                                <input onChange={(e) => formData.current.last = e.target.value} name='last'
                                    type="text"
                                    placeholder="Last name"
                                    required
                                />

                                <p className="input-title">Mail ID</p>
                                <input onChange={(e) => formData.current.email = e.target.value} name='email'

                                    type="email"
                                    placeholder="Mail id"
                                    required
                                />

                                <p className="input-title">Phone Number</p>
                                <input onChange={(e) => formData.current.phone = e.target.value} name='phone'
                                    type="number"
                                    placeholder="Phone number"
                                    required
                                />

                                <p className="input-title">About</p>
                                <textarea onChange={(e) => formData.current.about = e.target.value} name='about' rows={5} placeholder='Message here...' required></textarea>
                                {/* <button className='hover' type='submit'>Invite Now</button> */}
                                <button type="submit" className="hover">{isProcess ? (<span className="loading mini"></span>) : "Invite Now"}</button>
                            </div>
                            <img src={formMobile.src} />

                        </div>
                    </form>
                </div>

            </div>

        </div>

        </>
    )
}
