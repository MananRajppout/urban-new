"use-client";

import React, { useState, useEffect } from "react";
import mammoth from "mammoth";

import FileUpload from "../../Widget/FileUpload";
import {
  createChatSourceByFile,
  createChatbot,
} from "../../../lib/api/ApiCreateChatbot";
import toast from "react-hot-toast";

import fileIcon from "../../../assets/Icons/FileBlankIcon.svg";

import {
  deleteChatSource,
  updateChatSource,
} from "../../../lib/api/ApiUpdateChatbot";
import { useRouter } from "next/router";
import { countCharactersInPDF } from "@/Utils/reactPdf";

export default function Files({ files, setFiles, count }) {
  const router = useRouter();
  const { id } = router.query;

  async function onFileSelect(files) {
    if (!files) return;
    for (const iterator of files) {
      onFileSelected(iterator);
    }
  }

  async function onFileSelected(file) {
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (fileExt == "txt") {
      const reader = new FileReader();

      reader.onload = function (e) {
        const content = e.target.result;
        const data = {
          name: file.name,
          file: file,
          count: content.length,
          id: null,
        };

        // if (count + content.length > 400_000) {
        //   toast.error("Character limit reached")
        //   return
        // }
        setFiles((old) => {
          const clone = structuredClone(old);
          clone.isChanged = true;
          clone.data.push(data);
          return clone;
        });
      };

      // Read the selected file as text
      reader.readAsText(file);
    } else if (fileExt == "doc" || fileExt == "docx") {
      const reader = new FileReader();

      reader.onload = function (e) {
        const arrayBuffer = e.target.result;

        // Use mammoth to extract text content
        mammoth
          .extractRawText({ arrayBuffer: arrayBuffer })
          .then(function (result) {
            const charCount = result.value.length;

            const data = {
              name: file.name,
              file: file,
              count: charCount,
              id: null,
            };

            if (count + charCount > 400_000) {
              toast.error("Character limit reached");
              return;
            }

            setFiles((old) => {
              const clone = structuredClone(old);
              clone.isChanged = true;
              clone.data.push(data);
              return clone;
            });
          })
          .catch(function (error) {
            console.log(error, "Error reading the .docx file.");
          });
      };

      // Read the selected file as ArrayBuffer
      reader.readAsArrayBuffer(file);
    } else if (fileExt == "pdf") {
      const charCount = await countCharactersInPDF(file);

      const data = {
        name: file.name,
        file: file,
        count: charCount,
        id: null,
      };
      setFiles((old) => {
        const clone = structuredClone(old);
        clone.isChanged = true;
        clone.data.push(data);
        return clone;
      });
    }
  }

  async function onFileRemove(fileIndex) {
    const removeFile = structuredClone(files.data[fileIndex]);

    setFiles((old) => {
      const clone = structuredClone(old);
      clone.isChanged = true;
      const arr = clone.data.slice().filter((_, index) => index != fileIndex);
      clone.data = arr;
      return clone;
    });

    if (removeFile.id) {
      const res = await deleteChatSource(id, removeFile.id);
      if (res.data) {
        toast.success("File removed successfully");
      } else {
        toast.error("Failed to remove file");

        setFiles((old) => {
          const clone = structuredClone(old);
          clone.isChanged = true;
          clone.data.push(removeFile);
          return clone;
        });
      }
    }
  }

  // useEffect(() => {
  //   if (isClear == false) return;
  //   setFiles([]);

  //   setIsClear(false);
  // }, [isClear]);

  return (
    <>
      {files.data.length == 0 ? (
        <FileUpload onFileSelect={onFileSelect} />
      ) : (
        <>
          <div className="inner-holder">
            {files.data.map((value, index) => (
              <div key={index} className="file-tab">
                <img src={fileIcon.src} />
                <hr />
                <span>{value.name}</span>
                <button className="hover" onClick={() => onFileRemove(index)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
          <button className="hover">
            Add New
            <input
              onChange={(e) => onFileSelect(e.target.files)}
              type="file"
              accept=".doc, .docx, .txt, .pdf"
              multiple
            />
          </button>
        </>
      )}
    </>
  );
}
