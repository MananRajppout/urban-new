import { Device } from '@twilio/voice-sdk';
import AxiosInstance from '@/lib/axios';
import { generateWebCallAccessToken } from '@/lib/api/ApiAiAssistant';


// import { TelnyxRTC } from '@telnyx/webrtc'; //telnyx import globally
// Variables to hold instances
let device = null;
let audioContext = null;
let client = null;
let activeCall = null;
let stream = null; //this variable for the enablemicrophone and setmicrophone


// Constants for localStorage keys
const TOKEN_KEY = 'telnyxAccessToken';
const TOKEN_EXPIRATION_KEY = 'telnyxTokenExp';

/**
 * Logs messages to the console.
 * @param {string} message - The message to log.
 */
const log = (message) => {
  console.log(message);
};

/**
 * Requests microphone access from the user.
 * @returns {Promise<MediaStream>} - The media stream for the microphone.
 */
const enableMicrophone = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    log('Microphone access granted.');
    return stream;
  } catch (error) {
    log('Microphone access denied or error occurred:', error.message || error);
    throw error;
  }
};

/**
 * Requests speaker access and sets up an audio element to play sound.
 * @returns {HTMLAudioElement} - The audio element for speaker output.
 */
const enableSpeaker = () => {
  const audioElement = document.createElement('audio');
  audioElement.id = 'remoteMedia';
  audioElement.autoplay = true;
  document.body.appendChild(audioElement);
  return audioElement;
};

/**
 * Initializes the Twilio Device with the given access token.
 * @param {string} token - The Twilio access token.
 */
const initializeTwilioDevice = (token) => {
  if (typeof window === 'undefined') return; // Ensure code runs only on the client side
  log('Initializing Twilio Device with token:', token);
  device = new Device(token, {
    codecPreferences: ['opus', 'pcmu'],
    fakeLocalDTMF: true,
    enableRingingState: true,
    debug: true,
  });

  device.on('ready', () => {
    log('Twilio Device Ready!');
  });

  device.on('error', (error) => {
    log('Twilio Device Error: ' + error.message);
  });

  device.on('connect', (conn) => {
    log('Successfully established call!');
  });

  device.on('disconnect', (conn) => {
    log('Call ended.');
  });
};

/**
 * Initializes the Telnyx WebRTC client with the given access token.
 * @param {string} token - The Telnyx JWT access token.
 * @param {string} identity - The SIP URI or phone number to connect to.
 * @param {string} agentId - The agent ID for the call.
*/

/**
 * here initializeTelnyxClient testing code start 
 * =====================================================================================
*/
export const initializeTelnyxClient = async (token) => {
  if (typeof window === 'undefined') return; // Ensure code runs only on the client side


  try {
    const { TelnyxRTC } = await import('@telnyx/webrtc');

    client = new TelnyxRTC({
      login_token: token,
    });


    const audioElement = enableSpeaker(); // Ensure audio element is set up
    client.remoteElement = audioElement;


    await client.enableMicrophone();
    await client.connect(); // Only connect the client, no call initiated here


    sessionStorage.setItem("telnyxConnectionDetails", JSON.stringify({
      token: token,
      connected: true,
      timestamp: new Date().toISOString()

    }));

    client.on('telnyx.ready', () => {
      log('Telnyx Client Ready!');
    });

    client.on('telnyx.error', (error) => {
      log('Telnyx Client Error: ' + error.message);

    });

    client.on('telnyx.notification', (notification) => {
      if (notification.type === 'callUpdate') {
        handleCallUpdate(notification.call);
      }
    });

    return client;

  } catch (error) {
    log('Error connecting Telnyx client: ' + (error.message || error));
    sessionStorage.removeItem("telnyxConnectionDetails");
    return null;
  }
};

/**
 * here startWebCall function calling by makewebcall function
 * =====================================================================================
*/
export const startWebCall = async (agentId, identity) => {
  if (!client) {
    // log('Telnyx Client is not ready');
    return;
  }

  try {
    await handleUserGesture();

    activeCall = client.newCall({
      destinationNumber: identity,
      callerNumber: `${agentId}@sip.telnyx.com`,
      audio: true,
      video: false,
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], // STUN server configuration
      debug: true,
    });

    return activeCall;
  } catch (error) {
    log('Error starting the call: ' + error.message);
  }
};
/*==========================================================================================
 * here my testing code end 
*/

/**
 * Handles call state updates.
 * @param {ICall} call - The active call instance.
 */
const handleCallUpdate = (call) => {
  if (!call) return;

  switch (call.state) {
    case 'new':
      log('Call created, awaiting further actions.');
      break;
    case 'ringing':
      call.answer();
      break;
    case 'requesting':
      log('Call is requesting connection.');
      break;
    case 'trying':
      log('Attempting to establish call, trying state.');
      break;
    case 'active':
      log('Successfully established call!');
      break;
    case 'hangup':
      log('Call is hanging up.');
      break;
    case 'purge':
      log('Call is purging, cleaning up resources.');
      break;
    case 'destroy':
      log('Call ended.');
      cleanUpCall();
      break;
    case 'connecting':
      log('Call connecting.');
      break;
    default:
      log('Unhandled call state: ' + call.state);
  }
};

/**
 * Cleans up the current active call.
 */
const cleanUpCall = () => {
  if (activeCall) {
    activeCall.hangup(); // Clean up if not already done.
    activeCall = null;
  }

  // Clean up any media stream associated with the call
  if (stream) {
    stream.getTracks().forEach(track => track.stop()); // Stop all media tracks (audio, video)
    stream = null; // Clear the media stream reference
    log('Microphone stream stopped.');
  }
};

/**
 * Fetches the Telnyx access token from the server.
 * @returns {Promise<string>} - The Telnyx access token.
 * @throws Will throw an error if the token cannot be fetched.
 */
const fetchToken = async (agentId) => {
  try {
    const response = await generateWebCallAccessToken(agentId);
    return response;
  } catch (error) {
    console.error('Error fetching access token:', error);
    log('Could not get a token from server!');
    throw error;
  }
};

/**
 * Fetches and stores the token and expiration in localStorage.
 */
const fetchAndStoreToken = async (agentId) => {
  try {
    const tokenResponse = await fetchToken(agentId);
    const token = tokenResponse.data.token;

    // Decode the JWT to get the expiration time
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const tokenExp = decodedToken.exp - 60;

    // Store token and expiration in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRATION_KEY, tokenExp);

    console.log('New token generated and stored.');
    return token;
  } catch (error) {
    console.error('Error fetching new token:', error);
  }
};

/*here ends the fetchandstoretoken function----------------------*/

/**
 * Retrieves the token from localStorage and checks if it's still valid.
 * @returns {string|null} - The valid token or null if expired.
 */
const getValidToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const tokenExp = localStorage.getItem(TOKEN_EXPIRATION_KEY);

  if (!token || !tokenExp) return null; // No token stored

  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime >= tokenExp) {
    console.log('Token has expired.');
    return null; // Token is expired
  }

  console.log('Token is still valid.');
  return token; // Token is valid
};

/**
 * Ensures a valid token is available for use.
 * @returns {Promise<string|null>} - The valid token or null if fetching a new one fails.
 */
export const ensureValidToken = async (agentId) => {
  let token = getValidToken(); // Check if there's a valid token in localStorage

  if (!token) {
    // If no valid token, fetch a new one and store it
    token = await fetchAndStoreToken(agentId);
  }

  return token; // Return the valid token
};

/**
 * Handles user gesture to resume the audio context.
 */
const handleUserGesture = async () => {
  if (typeof window === 'undefined') return; // Ensure code runs only on the client side

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
};

/**
 * Makes a web call to the specified phone number using Telnyx.
 * @param {string} agentId - The phone number or SIP URI to call.
 */

const makeWebCall = async (agentId) => {
  if (typeof window === 'undefined') return;

  try {

    let connectionDetails = JSON.parse(sessionStorage.getItem("telnyxConnectionDetails") || "{}");
    const identity = `${agentId}@sip.telnyx.com`;

    if (!connectionDetails.connected || !client) {
      const token = await ensureValidToken(agentId);
      if (!token) return log('Error obtaining token for call.');

      client = await initializeTelnyxClient(token);
    } else {
      log('Reusing existing Telnyx client connection');

    }

    if (!client) {
      return log('Telnyx Client is not ready');
    }

    await startWebCall(agentId, identity);

  } catch (error) {
    log('Error making the call: ' + error.message);
  }
};

/**
 * Hangs up the current call.
 */
const hangUpWebCall = () => {
  log('Hanging up...');
  cleanUpCall();
  if (device) {
    device.disconnectAll();
  }

};

export { makeWebCall, hangUpWebCall };









