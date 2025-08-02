import React, { useEffect, useState, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import "../../styles/Dialog.css";
import { fetchAllVoices } from "@/lib/api/ApiAiAssistant";

export default function SelectVoiceDialog({
  isOpen,
  setIsOpen,
  updateVoice,
  voice_engine_name,
}) {
  const [voiceData, setVoiceData] = useState([]);
  const currentAudioRef = useRef(null);
  console.log({voice_engine_name})

  useEffect(() => {
    if (isOpen) {
      fetchAllVoices()
        .then((response) => {
          // voice_engine_name="11labs"
          let voices= []
          // const voices = [
          //   ...response.data.elevenlabs.map((voice) => ({
          //     ...voice,
          //     service: "elevenlabs",
          //   })),
          //   ...response.data.deepgram.map((voice) => ({
          //     ...voice,
          //     service: "deepgram",
          //   })),
          //   ...response.data.sarvam.map((voice) => ({
          //     ...voice,
          //     service: "sarvam",
          //   })),
          // ];
          
     
          if (voice_engine_name == "elevenlabs") {
            voices = [
              ...response.data.elevenlabs.map((voice) => ({
                ...voice,
                service: "elevenlabs",
              })),
            ];
          }
          else if(voice_engine_name=="sarvam"){
            voices = [
              ...response.data.sarvam.map((voice) => ({
                ...voice,
                service: "sarvam",
              })),
            ];
          } else if(voice_engine_name=="smallest"){
            voices = [
              ...response.data.smallest.map((voice) => ({
                ...voice,
                service: "smallest",
              })),
            ];
          }else if(voice_engine_name=="rime"){
          
            voices = [
              ...response.data.rime.map((voice) => ({
                ...voice,
                service: "rime",
              })),
            ];
          }
          else if(voice_engine_name=="kokoro"){
            voices = [
              ...response.data.kokoro.map((voice) => ({
                ...voice,
                service: "kokoro",
              })),
            ];
          }
          setVoiceData(voices);
        })
        .catch((error) => {
          console.error("Error fetching voices:", error);
        });
    }
  }, [isOpen, voice_engine_name]);

  const handleAudioPlay = (audio) => {
    if (currentAudioRef.current && currentAudioRef.current !== audio) {
      currentAudioRef.current.pause();
    }
    currentAudioRef.current = audio;
  };

  const handleCloseModel = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="dialog-outer fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="min-w-[50vw] bg-[var(--color-surface2)] rounded-3xl p-6">
            <div className="rounded-3xl">
              {/* Modal header */}
              <div className="flex items-start justify-between border-b pb-3 rounded-t dark:border-gray-600">
                <h3 className="text-2xl font-bold m-0 text-white">
                  Select a Voice
                </h3>
                <span
                  onClick={handleCloseModel}
                  className="bg-transparent rounded-full cursor-pointer text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </span>
              </div>

              {/* Modal body */}
              <div className="mt-4 h-[60vh] overflow-auto">
                <table className="w-full h-full text-sm text-left rtl:text-right text-gray-400">
                  <thead className="text-xs uppercase bg-[#373737] font-bold">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Demo Audio
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Voice ID
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Accent
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Gender
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Age
                      </th>
                      {/* <th scope="col" className="px-6 py-3">Pricing</th> */}
                      <th scope="col" className="px-1 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="overflow-auto h-[200px]">
                    {voiceData.map((voice, index) => (
                      <tr
                        key={index}
                        onClick={() => {
                          updateVoice(
                            voice.voice_id,
                            voice.service,
                            voice?.name
                          );
                          handleCloseModel();
                        }}
                        className="hover:bg-neutral-800 cursor-pointer transition duration-300 ease-in-out"
                      >
                        <td className="px-1 py-2 w-10">
                          <audio
                            controls
                            className="w-64"
                            onPlay={(e) => handleAudioPlay(e.target)}
                          >
                            <source src={voice.voice_url} type="audio/mpeg" />
                          </audio>
                        </td>
                        <td
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap max-w-[200px] overflow-hidden"
                        >
                          {voice.name}
                        </td>
                        <td className="px-6 py-4">{voice.voice_id}</td>
                        <td className="px-6 py-4">{voice.accent}</td>
                        <td className="px-6 py-4">{voice.gender}</td>
                        <td className="px-6 py-4">{voice.age}</td>
                        {/* <td className="px-6 py-4">
                          ${voice.service === "deepgram" ? "0.08" : "0.10"}/min
                        </td> */}
                        <td className="px-6 py-4">
                          <FaCheck
                            width={24}
                            height={24}
                            alt=""
                            className="hover:bg-slate-400 hover:rounded-full hover:text-black cursor-pointer transition duration-300 ease-in-out"
                            onClick={handleCloseModel}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
