const {Client} = require('plivo');

const plivoClient = new Client(
    process.env.PLIVO_AUTH_ID,
    process.env.PLIVO_AUTH_TOKEN
)

module.exports = plivoClient;