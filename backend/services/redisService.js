const dotenv = require('dotenv');
dotenv.config();

const Redis = require('ioredis');


const dids = new Map();

const redisSub = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
  username: process.env.REDIS_USER,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redisSub.on('connect', () => console.log('✅ Redis subscriber connected'));
redisSub.on('error', (err) => console.error('❌ Redis subscriber error:', err));

async function subscribe(channels, onMessage) {
  const channelList = Array.isArray(channels) ? channels : [channels];

  await redisSub.subscribe(...channelList);
  console.log(`📡 Subscribed to: ${channelList.join(', ')}`);

  redisSub.on('message', (channel, message) => {
    try {
      onMessage(channel, message);
    } catch (err) {
      console.error('Error in message callback:', err);
    }
  });
}


const waitForCallComplete = async (callId) => {
    return new Promise((resolve, reject) => {
        dids.set(callId, {
            complete: () => {
                resolve(true);
            }
        });
    });
}

const startSubscription = async () => {
    subscribe("call:complete", (channel, message) => {
        const { callId,status } = JSON.parse(message);
        console.log(`Call ${callId} status changed to ${status}`);

        const details = dids.get(callId);
        if (details){
            details.complete();
            dids.delete(callId);
        } else {
            console.log(`Call ${callId} not found`);
        }
    });
}
module.exports = { startSubscription, dids, waitForCallComplete };
