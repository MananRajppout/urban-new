const Agenda = require("agenda");
const dotenv = require("dotenv");
const { SheetConfig, AiAgent } = require("../voice_ai/model");
const { processNextCall } = require("../v2/controller/sheetController");
const { OutboundCallTask } = require("../user/model");
dotenv.config();

const agenda = new Agenda({
    db: { address: process.env.MONGODB_URL, collection: "jobs" },
});
  
agenda.define("execute user task", async (job) => {
    const { user_id, agent_id, task_id } = job.attrs.data;
    console.log(`Executing job for user ${user_id} (agent: ${agent_id}) at ${new Date()}`);
    const sheetConfig = await SheetConfig.findOne({ agent_id });
    const agent = await AiAgent.findById(agent_id);

    await processNextCall(sheetConfig, agent);

    //change outbound call task status to completed
    await OutboundCallTask.findByIdAndUpdate(task_id, { status: "completed" });
});
  

module.exports = agenda;