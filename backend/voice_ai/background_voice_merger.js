const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfprobePath(ffprobePath);
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');

function loopBackgroundSound(bgSound, duration, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(bgSound)
      .inputOptions([`-stream_loop -1`, `-t ${duration}`])
      .on('end', () => {
        console.log('Looping finished!');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during looping: ' + err.message);
        reject(err);
      })
      .save(output);
  });
}

function mergeSounds(mainVoice, bgSound, output, durationOption, bgVolume = 0.3) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(mainVoice)
      .input(bgSound)
      .complexFilter([
        `[1]volume=${bgVolume}[bg]; [0][bg]amix=inputs=2:duration=${durationOption}:dropout_transition=2`
      ])
      .on('end', () => {
        console.log('Merging finished!');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during merging: ' + err.message);
        reject(err);
      })
      .save(output);
  });
}

function changeSpeed(input, output, speed) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioFilters(`atempo=${speed}`)
      .on('end', () => {
        console.log('Speed change finished!');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during speed change: ' + err.message);
        reject(err);
      })
      .save(output);
  });
}

function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) {
        console.error('Error during ffprobe: ' + err.message);
        reject(err);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
}

async function processAudio(mainVoice, bgSound, finalOutput, tempLoopedBg, bgVolume) {
  try {
    // const tempLoopedBg = 'C:/Users/Optimus/OneDrive/Documents/temp_looped_bg.mp3';

    // Get the durations of the main voice and background sound
    const mainVoiceDuration = await getAudioDuration(mainVoice);
    const bgSoundDuration = await getAudioDuration(bgSound);

    let durationOption;

    if (bgSoundDuration < mainVoiceDuration) {
      // Loop the background sound to match the main voice duration
      await loopBackgroundSound(bgSound, mainVoiceDuration, tempLoopedBg);
      durationOption = 'longest';
    } else {
      // Use the background sound as is
      fs.copyFileSync(bgSound, tempLoopedBg);
      durationOption = 'shortest';
    }

    // Merge the background sound with the main voice
    await mergeSounds(mainVoice, tempLoopedBg, finalOutput, durationOption, bgVolume);

    // // Change the speed of the final output if needed
    // const finalOutputWithSpeed = finalOutput.replace('.mp3', `_speed_${speed}.mp3`);
    // await changeSpeed(finalOutput, finalOutputWithSpeed, speed);

    console.log('All operations completed successfully!');
    return finalOutput;
  } catch (error) {
    console.error('Error: ' + error.message);
    throw error;
  }
}

// Export the individual functions and the main processing function
module.exports = {
  loopBackgroundSound,
  mergeSounds,
  changeSpeed,
  getAudioDuration,
  processAudio
};
