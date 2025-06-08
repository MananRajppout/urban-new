// import AgentModel, { IAgent } from "../models/agent.model.js";
import mongoose from "mongoose";
import { IAiAgent } from "../models/agent.model.js";
import { HttpException } from "../utils/HttpException.js";
import { getDb } from "../config/database.js";

const AGENT_COLLECTION = "aiagents";
const USER_COLLECTION = "users";
export default class AgentService {
  static async getAgentById(agentId: string) {
    const agent = await getDb()
      .collection(AGENT_COLLECTION)
      .findOne<IAiAgent>({ _id: new mongoose.Types.ObjectId(agentId) });
    if (!agent) {
      throw HttpException.notFound("Agent not found by id " + agentId);
    }
    const user = await getDb()
      .collection(USER_COLLECTION)
      .findOne({ _id: agent.user_id });
    if (!user) {
      throw HttpException.notFound("User not found by id " + agent.user_id);
    }
    agent.elevenlabs_api_key = user.elevenlabs_api_key;
    console.log("AgentService -> getAgentById -> agent", user);

    return agent as IAiAgent;
  }
  static async updateAgentById(agentId: string, updateData: Partial<IAiAgent>) {
    const result = await getDb()
      .collection(AGENT_COLLECTION)
      .findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(agentId) }, // Find by ID
        { $set: updateData }, // Update the provided fields
        { returnDocument: "after" } // Return updated document
      );

    if (!result) {
      throw HttpException.notFound("Agent not found by id " + agentId);
    }

    return result; // Updated agent data
  }

  static async getAgentByPlivoPhone(phone: string) {
    const agent = await getDb()
      .collection(AGENT_COLLECTION)
      .findOne({ plivo_phone_number: phone });
    if (!agent) {
      throw HttpException.notFound("Agent not found by phone number " + phone);
    }
    return agent as IAiAgent;
  }
}
