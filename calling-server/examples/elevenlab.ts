// import { Readable, PassThrough } from "stream";
// import env from "../src/envConfig.js";
// import { ElevenLabSocket } from "../src/sockets/ElevenLabSocket.js";
// import ffmpeg from "fluent-ffmpeg";
// import fs from "fs";
// const elevenLabVoiceId = "FFmp1h1BMl0iVHA0JxrI";
// const elevenLabVoiceModel = "eleven_flash_v2_5";
// const elevenLabVoiceUri = `wss://api.elevenlabs.io/v1/text-to-speech/${elevenLabVoiceId}/stream-input?model_id=${elevenLabVoiceModel}&inactivity_timeout=60`;
// const outputDir = "./temp/audio";
// try {
//   fs.accessSync(outputDir, fs.constants.R_OK | fs.constants.W_OK);
// } catch (err) {
//   fs.mkdirSync(outputDir);
// }
// const writeStream = fs.createWriteStream(outputDir + "/test.mp3", {
//   flags: "a",
// });
// const elevenLabSocket = new ElevenLabSocket(elevenLabVoiceUri, {
//   headers: { "xi-api-key": `${env.ELEVENLABS_API_KEY}` },
// });

// const ambientSoundBuffer = fs.readFileSync("./other/cafe-noise.mp3");

// // elevenLabSocket.addEventListener("Audio", ({ audio }) => {
// //   // this audio is mp3 encoded
// //   // console.log("audio", audio);
// //   //TODO mix audio with ambient sound

// //   const audioBuffer = Buffer.from(audio, "base64");
// //   const writeStream = fs.createWriteStream("./temp/output/mixed_audio.mp3");
// //   const ambientSoundStream = fs.createReadStream("./other/cafe-noise.mp3");

// //   const audioStream = new Readable();
// //   audioStream.push(audioBuffer);
// //   audioStream.push(null); // End the stream

// //   ffmpeg()
// //     .input(audioStream) // Input the Base64 decoded audio as a stream
// //     .input(ambientSoundStream) // Input the ambient sound file as a stream
// //     .audioFilter("amix=inputs=2:duration=longest") // Mix the two audio files
// //     .on("end", () => {
// //       console.log("Audio mixing complete!");
// //     })
// //     .on("error", (err) => {
// //       console.error("Error during audio mixing:", err);
// //     })
// //     .pipe(writeStream, { end: true });
// //   // writeToLocal(audio, writeStream);
// // });

// const createAmbientLoop = () => {
//   const loop = new PassThrough();
//   ffmpeg()
//     .input("./other/cafe-noise.mp3")
//     .inputOptions(["-stream_loop -1"]) // Infinite loop
//     .outputOptions(["-f mp3"])
//     .on("error", (err) => console.error("Ambient loop error:", err))
//     .pipe(loop);
//   return loop;
// };
// const ambientLoop = createAmbientLoop();

// elevenLabSocket.addEventListener("Audio", ({ audio }) => {
//   // Convert base64 audio to stream
//   const audioStream = new PassThrough();
//   audioStream.end(Buffer.from(audio, "base64"));

//   // Create output stream
//   const mixedStream = new PassThrough();

//   // FFmpeg processing pipeline
//   ffmpeg()
//     .input(audioStream)
//     .input(ambientLoop)
//     .complexFilter([
//       "[0:a][1:a]amix=inputs=2:duration=first[mix]", // Mix both audio streams
//     ])
//     .outputFormat("mp3")
//     .audioCodec("libmp3lame")
//     .audioQuality(5)
//     .on("end", () => console.log("Processing complete"))
//     .on("error", (err) => console.error("Processing error:", err))
//     .pipe(mixedStream, { end: false });

//   // Real-time chunk processing
//   mixedStream.on("data", (chunk) => {
//     // Send processed audio chunks immediately
//     console.log("Sending audio chunk", chunk);
//   });

//   // Handle stream cleanup
//   audioStream.on("end", () => {
//     mixedStream.end();
//     console.log("Audio stream ended");
//   });
// });

// const text = "Hello, how are you doing today?";
// setInterval(() => {
//   elevenLabSocket.sendText(text, true);
// }, 1000);

// function writeToLocal(base64str: any, writeStream: fs.WriteStream) {
//   const audioBuffer: Buffer = Buffer.from(base64str, "base64");
//   writeStream.write(audioBuffer, (err) => {
//     if (err) {
//       console.error("Error writing to file:", err);
//     }
//   });
// }
