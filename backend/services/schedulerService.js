const Agenda = require("agenda");
const dotenv = require("dotenv");
const { SheetConfig, AiAgent } = require("../voice_ai/model");
const { OutboundCallTask } = require("../user/model");
const googleSheetsService = require("./googlesheets.service");
const { PlivoPhoneRecord } = require("../v2/model/plivoModel");
const { createSIPParticipant } = require("../v2/utils");
const CallHistory = require("../voice_ai/model").CallHistory;
const uuid = require("uuid");
dotenv.config();



const processNextCall = async (config, agent) => {
    try {
      // Store the original base prompt
      const originalBasePrompt = agent.base_prompt;
        console.log("console 1");
      while (config.status === 'processing') {
        // Refresh config from database
        const freshConfig = await SheetConfig.findById(config._id);
        if (!freshConfig || freshConfig.status !== 'processing') {
          break;
        }
        console.log("console 2");
        // Get next row
        const row = await googleSheetsService.getNextRow(
          config.spreadsheet_id,
          config.sheet_name,
          config.current_row
        );

        console.log("row", row,config.current_row,config.sheet_name,config.spreadsheet_id);
  
  
        if (!row) {
          config.status = 'completed';
          await config.save();
          break;
        }
        console.log("console 3");
  
        // Get customer name and context from the row
        const customerName = row[Object.keys(config.column_mappings)
          .find(key => key.includes('customer name'))?.replace(/[<>]/g, '')];
        const context = row[Object.keys(config.column_mappings)
          .find(key => key.includes('context'))?.replace(/[<>]/g, '')];
        console.log("console 4");
        const phoneNumber = row[Object.keys(config.column_mappings)
          .find(key => key.includes('phone'))?.replace(/[<>]/g, '')];
  
        if (!phoneNumber || !phoneNumber.match(/^\+?[\d\s-()]+$/)) {
          await googleSheetsService.updateRowStatus(
            config.spreadsheet_id,
            config.sheet_name,
            config.current_row,
            'Invalid Phone Number'
          );
          config.failed_calls++;
          config.processed_rows++;
          config.current_row++;
          await config.save();
          continue;
        }
        console.log("console 5");

        try {
          // Update agent's base prompt with customer information temporarily
          // const customerInfo = `\n\nCustomer Information:\nCustomer Name: ${customerName || 'Not provided'}\nContext: ${context || 'Not provided'}\n\nUse this information while speaking with the customer.`;
          // agent.base_prompt = `${originalBasePrompt}${customerInfo}`;
          // await agent.save();
  
          // Make call using plivoClient
          // const serverUrl = process.env.SERVER_URL;
          // const answer_url = `${serverUrl}/api/phone/webhook/voice?outbound=true&customer_name=${encodeURIComponent(customerName || '')}&context=${encodeURIComponent(context || '')}&phone_number=${encodeURIComponent(phoneNumber)}`;
  
          // const response = await plivoClient.calls.create(
          //   agent.plivo_phone_number,
          //   phoneNumber,
          //   answer_url
          // );
  
          const phoneRecord = await PlivoPhoneRecord.findOne({
            phone_number: agent.plivo_phone_number,
          })
          
          const callId = uuid.v4();
          const sipCallId = await createSIPParticipant(`+${phoneNumber}`, agent.plivo_phone_number, phoneRecord.sip_outbound_trunk_id, agent._id, customerName,context,callId,true);
          // Create a new CallHistory record with all required fields
          const callHistory = new CallHistory({
            caller_id: sipCallId,
            user_id: agent.user_id,
            agent_id: agent._id,
            voice_name: agent.voice_name,
            voice_engine_id: "-",
            chatgpt_model: agent.chatgpt_model,
            voice_id: agent.voice_id,
            plivo_phone_number: phoneRecord.phone_number,
            from_phone_number: phoneNumber,
            sheet_call: true,
            sheet_row: config.current_row,
            start_time: new Date(),
            calltype: "plivo"
          });
  
          await callHistory.save();
          console.log("CallHistory created:", callHistory);
  
          await googleSheetsService.updateRowStatus(
            config.spreadsheet_id,
            config.sheet_name,
            config.current_row,
            'Call Initiated'
          );
  
          // Restore the original base prompt after the call
          // agent.base_prompt = originalBasePrompt;
          // await agent.save();
  
          config.processed_rows++;
          config.current_row++;
          config.last_processed_time = new Date();
          await config.save();
  
          // Wait for configured delay between calls
          await new Promise(resolve => setTimeout(resolve, config.call_delay));
        } catch (error) {
          // Restore the original base prompt in case of error
          // agent.base_prompt = originalBasePrompt;
          // await agent.save();
  
          console.error('Error making call:', error);
          config.failed_calls++;
          config.error_message = error.message;
          config.last_error_time = new Date();
          await config.save();
  
          await googleSheetsService.updateRowStatus(
            config.spreadsheet_id,
            config.sheet_name,
            config.current_row,
            'Failed to Initiate Call'
          );
        }
      }
    } catch (error) {
      console.error('Error processing calls:', error);
      config.status = 'error';
      config.error_message = error.message;
      config.last_error_time = new Date();
      await config.save();
    } finally {
      config.sheet_call = false;
      await config.save();
    }
} 


const agenda = new Agenda({
    db: { address: process.env.MONGODB_URL, collection: "jobs" },
});
  
// agenda.define("execute user task", async (job) => {
//     try {
//         const { user_id, agent_id, task_id } = job.attrs.data;
//         console.log(`Executing job for user ${user_id} (agent: ${agent_id}) at ${new Date()}`);
//         const sheetConfig = await SheetConfig.findOne({ agent_id });
//         const agent = await AiAgent.findById(agent_id);

//         sheetConfig.status = 'processing';
//         sheetConfig.last_processed_time = new Date();
//         await sheetConfig.save();

//         await processNextCall(sheetConfig, agent);
//         console.log("processNextCall completed");

//         //change outbound call task status to completed
//         await OutboundCallTask.findByIdAndUpdate(task_id, { status: "completed" });
//     } catch (error) {
//         console.error("Error executing user task", error);
//         await OutboundCallTask.findByIdAndUpdate(task_id, { status: "failed" });
//     }
// });

agenda.define('make a call', async (job) => {
    try {
        const { user_id, agent_id, task_id } = job.attrs.data;
        console.log(`Executing job for user ${user_id} (agent: ${agent_id}) at ${new Date()}`);
        const sheetConfig = await SheetConfig.findOne({ agent_id,is_active: true });
        const agent = await AiAgent.findById(agent_id);

        sheetConfig.status = 'processing';
        sheetConfig.last_processed_time = new Date();
        sheetConfig.current_row = 2;
        await sheetConfig.save();

        await processNextCall(sheetConfig, agent);
        console.log("processNextCall completed");

        //change outbound call task status to completed
        await OutboundCallTask.findByIdAndUpdate(task_id, { status: "completed" });
    } catch (error) {
        console.error("Error executing user task", error);
        await OutboundCallTask.findByIdAndUpdate(task_id, { status: "failed" });
    }
});


agenda.on("start:execute user task", (job) => {
    console.log("➡️ start", job.attrs._id.toString(), new Date().toISOString());
});
  
agenda.on("success:execute user task", (job) => {
    console.log("✅ success", job.attrs._id.toString(), new Date().toISOString());
});
  
agenda.on("fail:execute user task", (err, job) => {
    console.error("❌ fail", job && job.attrs && job.attrs._id ? job.attrs._id.toString() : "?", err);
});

module.exports = agenda;