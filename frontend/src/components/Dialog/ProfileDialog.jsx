import React, { useContext, useEffect, useRef, useState } from "react";

import "../../styles/Dialog.css"
import toast from "react-hot-toast";
import { updateProfile } from "../../lib/api/ApiExtra";
import { ProfileContext } from "@/pages/_app";
// import profileIcon from "../../assets/MyProfileImage.png"


export default function ProfileDialog({ isOpen, onDialogClose, profileData, setProfileData }) {

  const [isProcess, setIsProcess] = useState(false)
  const [profileImage, setProfileImage] = useState("")
  const fileInput = useRef()
  const maxSize = 1; // MB
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const { globalProfileData, setGlobalProfileData } = useContext(ProfileContext);



  function handleFileSelect() {
    const file = fileInput.current.files[0];
    if (file) {
      // Check file size
      if (file.size > 1024 * 1024 * maxSize) {
        toast.error(`File size exceeds ${maxSize}MB. Please choose a smaller file.`)
        fileInput.current.value = ''; // Clear the file input
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {
        console.log(e.target.result)
        setProfileImage(e.target.result)
      };

      // Read the file as a data URL (base64)
      reader.readAsDataURL(file);
    }
  }



  useEffect(() => {
    localStorage.setItem("profile_image", profileData.image)
    setName(profileData.name)
    setEmail(profileData.email)
    setProfileImage(profileData.image)

  }, [])


  function close(className) {

    if (isProcess) return

    if (className == 'dialog-outer') {
      onDialogClose()
    }
  }


  async function onSubmit(event) {
    event.preventDefault()

    if (isProcess) return
    setIsProcess(true)
    const res = await updateProfile(profileImage, name, email)
    if (res.data) {
      localStorage.setItem("profile_image", profileImage)

      toast.success("Profile updated successfully")
      onDialogClose()
      setProfileData((old) => {
        let clone = structuredClone(old)
        clone.name = name
        clone.email = email
        clone.image = profileImage
        return clone
      })

      setGlobalProfileData({ image: profileImage })

    } else {
      toast.error(res.message)
    }

    setIsProcess(false)

  }


  return <>
    {isOpen && <div className="dialog-outer" onClick={(e) => close(e.target.className)}>
      <div className="dialog">
        <h3 className="title">Update Profile</h3>

        <form onSubmit={onSubmit}>
          <div className="input-image">

            <img src={profileImage} />
            <div className="edit-icon hover">
              <input ref={fileInput} accept="image/*" type="file" onChange={handleFileSelect} />
              <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.94 5 19 10.06 9.062 20a2.25 2.25 0 0 1-.999.58l-5.116 1.395a.75.75 0 0 1-.92-.921l1.395-5.116a2.25 2.25 0 0 1 .58-.999L13.938 5Zm7.09-2.03a3.578 3.578 0 0 1 0 5.06l-.97.97L15 3.94l.97-.97a3.578 3.578 0 0 1 5.06 0Z" /></svg>
            </div>
          </div>
          <span className="center-title">{name}</span>

          <br />
          <br />

          <div className="input-container">
            <p className="heading">Name</p>
            <input required value={name} style={{ width: '100%' }} onChange={(e) => setName(e.target.value)} className="text-field" />
          </div>
          <div className="input-container">
            <p className="heading">Email</p>
            <input required value={email} style={{ width: '100%' }} type="email" onChange={(e) => setEmail(e.target.value)} className="text-field" />
          </div>
          <br />
          <br />

          <div className="profile-btn-holder">
            <button type="button" onClick={() => close("dialog-outer")} className="hover outline">Close</button>
            <button type="submit" className="hover primary">{isProcess ? (<span className="loading dark mini"></span>) : "Update Profile"}</button>
          </div>
        </form>

      </div>
    </div>}</>
}
