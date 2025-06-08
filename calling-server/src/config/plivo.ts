import { Client } from "plivo";
import env from "./env.js";

const plivoClient = new Client(env.PLIVO_AUTH_ID, env.PLIVO_AUTH_TOKEN);

export default plivoClient;