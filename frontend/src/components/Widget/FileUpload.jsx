import React from "react";

import "../../styles/Widget/file-upload.css";
import uploadIcon from "@/assets/Icons/uploadIcon.svg";
import UploadIcon from "../icons/UploadIcon";

export default function FileUpload({ onFileSelect }) {
  function onSelect(files) {
    if (files) {
      onFileSelect(files);
    }
  }

  return (
    <div className="file-upload">
      <div className="file-upload-inner">
        <div className="icon">
          <UploadIcon />
        </div>
        <h4>Drag & drop files here, or click to select files</h4>
        <p>Supported File Types : .pdf, .doc, .docx, .txt</p>
        <input
          onChange={(e) => onSelect(e.target.files)}
          type="file"
          accept=".pdf, .doc, .docx, .txt"
          multiple
        />
      </div>
    </div>
  );
}
