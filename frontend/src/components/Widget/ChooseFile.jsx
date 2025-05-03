import React, { useRef } from "react";

import '../../styles/Widget/choose-file.css'
import toast from "react-hot-toast";


// max size is in (mb)
export default function ChooseFile({ maxSize = 1, onFileSelect }) {
    const fileInput = useRef()

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
                onFileSelect(e.target.result)
            };

            // Read the file as a data URL (base64)
            reader.readAsDataURL(file);
        }
    }

    return <div className="choose-file-widget hover">
        <button>Choose File</button>
        <input ref={fileInput} accept="image/*" type="file" onChange={handleFileSelect} />
    </div>


}