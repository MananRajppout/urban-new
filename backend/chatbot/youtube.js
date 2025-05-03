const { YoutubeTranscript } = require('youtube-transcript');
const { getUniqueFileName } = require("../utils/infra");
const fs = require('fs');

async function fetchTranscript(url) {

    try {
        const yt_transcript_response = await YoutubeTranscript.fetchTranscript(url);
        yt_transcript = JSON.stringify(yt_transcript_response);
        const transcript_filename = process.env.STATIC_FILES + getUniqueFileName();

        await fs.writeFileSync(transcript_filename, yt_transcript);
        return {transcript_filename:transcript_filename, characters:yt_transcript.length}
    } catch (error) {
        console.log("error infetchTranscript : ", error)
        return {transcript_filename:false, characters:false}
    }
}

module.exports = {
    fetchTranscript
}