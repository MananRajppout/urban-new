// import WebSocket from "ws";
// import { PlivoSocket } from "./sockets/PlivoSocket.js";
// import { ElevenLabSocket } from "./sockets/ElevenLabSocket.js";
// import env from "./config/env.js";
// import { OpenAiSocket } from "./sockets/OpenAiSocket.js";
// import { DEFAULT_PROMPT, DEFAULT_TOOLS, loadInstruction } from "./utils.js";

// const elevenLabVoiceId = "FFmp1h1BMl0iVHA0JxrI";
// const elevenLabVoiceModel = "eleven_flash_v2_5";
// const elevenLabVoiceUri = `wss://api.elevenlabs.io/v1/text-to-speech/${elevenLabVoiceId}/stream-input?model_id=${elevenLabVoiceModel}&output_format=ulaw_8000&enable_logging=true&inactivity_timeout=60`;

// function createConnection(plivoWs: WebSocket) {
//   const plivoSocket = new PlivoSocket({
//     ws: plivoWs,
//   });
//   const elevenLabSocket = new ElevenLabSocket({
//     url: elevenLabVoiceUri,
//     configs: {
//       headers: { "xi-api-key": `${env.ELEVENLABS_API_KEY}` },
//     },
//   });
//   const openAiWebsocket = new OpenAiSocket({
//     url: "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
//     configs: {
//       headers: {
//         Authorization: "Bearer " + env.OPENAI_API_KEY,
//         "OpenAI-Beta": "realtime=v1",
//       },
//     },
//   });
//   openAiWebsocket.addEventListener("open", () => {
//     const instructions = loadInstruction();
//     openAiWebsocket.updateSession(instructions, DEFAULT_TOOLS);
//     // say hello to the user
//     openAiWebsocket.sendUserMessage('Greet the user and introduce yourself"');
//   });

//   // close other socket
//   plivoSocket.addEventListener("close", () => {
//     elevenLabSocket.close();
//     openAiWebsocket.close();
//   });

//   return { plivoSocket, elevenLabSocket, openAiWebsocket };
// }
// export function initCall(plivoWs: WebSocket) {
//   let isEndCall = false;
//   const { plivoSocket, elevenLabSocket, openAiWebsocket } =
//     createConnection(plivoWs);

//   plivoSocket.addEventListener("Media", ({ audio }) => {
//     // console.log("media", audio);
//     if (openAiWebsocket.isReady) {
//       openAiWebsocket.sendAudio(audio);
//     }
//   });

//   openAiWebsocket.addEventListener("ResponseTextDelta", ({ delta }) => {
//     elevenLabSocket.sendText(delta);
//   });
//   openAiWebsocket.addEventListener("ResponseTextDone", ({ text }) => {
//     console.log("ResponseTextDone", text);
//     elevenLabSocket.sendText(" ", true);
//   });
//   openAiWebsocket.addEventListener("InputAudioStarted", () => {
//     plivoSocket.clearAudio();
//     openAiWebsocket.cancelResponse();
//   });
//   elevenLabSocket.addEventListener("Audio", ({ audio }) => {
//     plivoSocket.sendAudio(
//       audio,
//       isEndCall ? { checkPoint: { name: "endCall" } } : undefined
//     );
//   });

//   openAiWebsocket.addEventListener("FunctionCallEndCall", ({ message }) => {
//     isEndCall = true;
//     elevenLabSocket.sendText(message, true);
//   });
// }
