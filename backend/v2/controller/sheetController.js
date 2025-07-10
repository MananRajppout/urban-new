const catchAsyncError = require("../../middleware/catchAsyncError");
const { SheetConfig, AiAgent } = require("../../voice_ai/model.js");
const googleSheetsService = require("../../services/googlesheets.service");
const axios = require("axios");
const plivoClient = require("../configs/plivoClient");
const { createSIPParticipant } = require("../utils.js");
const { PlivoPhoneRecord } = require("../model/plivoModel.js");
const CallHistory = require("../../voice_ai/model.js").CallHistory;
const uuid = require("uuid")
exports.configureSheet = catchAsyncError(async (req, res) => {
  const { agent_id, spreadsheet_id, sheet_name, column_mappings,mapped } = req.body;
  const user_id = req.user.id;

  // Get agent details
  const agent = await AiAgent.findById(agent_id);
  if (!agent) {
    return res.status(404).json({
      success: false,
      message: "Agent not found"
    });
  }

  // Validate sheet exists and is accessible
  try {
    const headers = await googleSheetsService.getHeaders(spreadsheet_id, sheet_name);
    if (!headers || headers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Unable to access sheet or sheet is empty"
      });
    }

    // Get total rows

    const allRows = await googleSheetsService.getAllRows(spreadsheet_id, sheet_name);
    const total_rows = allRows.length - 1; // Excluding header row

    // Validate column mappings
    const mappedColumns = Object.keys(column_mappings);
    const missingColumns = mappedColumns.filter(col => 
      !headers.find(header => header.toLowerCase() === column_mappings[col].toLowerCase()));

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing columns in sheet: ${missingColumns.join(', ')}`
      });
    }

    // Deactivate existing configurations
    await SheetConfig.updateMany(
      { agent_id, is_active: true },
      { is_active: false }
    );

    // Create new configuration
    const config = await SheetConfig.create({
      agent_id,
      user_id,
      spreadsheet_id,
      sheet_name,
      column_mappings,
      is_active: true,
      total_rows,
      status: 'idle',
      mapped,
    });

    // Update agent's base prompt with column mappings
    const columnInstructions = Object.entries(column_mappings)
      .map(([col, desc]) => `${col} = ${desc}`)
      .join('\n');

    // agent.base_prompt = `${agent.base_prompt}\n\nColumn Mappings for Lead Data:\n${columnInstructions}\n\nUse this information while speaking with customers.`;
    await agent.save();

    res.status(200).json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error configuring sheet:', error);
    res.status(500).json({
      success: false,
      message: "Error configuring sheet",
      error: error.message
    });
  }
});

exports.startCalls = catchAsyncError(async (req, res) => {
  const { agent_id } = req.body;
  const user_id = req.user.id;

  const config = await SheetConfig.findOne({ agent_id, is_active: true });
  if (!config) {
    return res.status(400).json({
      success: false,
      message: "No active sheet configuration found"
    });
  }

  // Get agent details
  const agent = await AiAgent.findById(agent_id);
  if (!agent || !agent.plivo_phone_number) {
    return res.status(400).json({
      success: false,
      message: "Agent not found or no phone number configured"
    });
  }



  // If status is completed or error, reset the configuration
  if (config.status === 'completed' || config.status === 'error') {
    // Get current sheet data
    const rows = await googleSheetsService.getAllRows(
      config.spreadsheet_id,
      config.sheet_name
    );
    
    const total_rows = rows.length - 1; // Excluding header row
    
    // Reset configuration
    config.current_row = 2; // Start from row 2 (after headers)
    config.status = 'idle';
    config.total_rows = total_rows;
    config.processed_rows = 0;
    config.successful_calls = 0;
    config.failed_calls = 0;
    config.error_message = null;
    config.last_error_time = null;
    config.last_processed_time = null;
    await config.save();
  }

  if (config.status === 'processing') {
    return res.status(400).json({
      success: false,
      message: "Calls are already in progress"
    });
  }

  // Update status to processing
  config.status = 'processing';
  config.last_processed_time = new Date();
  await config.save();

  // Start processing in background
  processNextCall(config, agent);

  res.status(200).json({
    success: true,
    message: "Call processing started"
  });
});

exports.getSheetHeader = catchAsyncError(async (req, res) => {
  const { spreadsheet_id,sheet_name } = req.body;
  const headers = await googleSheetsService.getHeaders(
    spreadsheet_id,
    sheet_name
  );

  res.status(200).json({
    success: true,
    headers: headers
  });
});


exports.stopCalls = catchAsyncError(async (req, res) => {
  const { agent_id } = req.body;
  const user_id = req.user.id;

  const config = await SheetConfig.findOne({ agent_id, is_active: true });
  if (!config) {
    return res.status(400).json({
      success: false,
      message: "No active sheet configuration found"
    });
  }

  // Get agent details and reset the sheet_calls_active flag
 

  config.status = 'paused';
  await config.save();

  res.status(200).json({
    success: true,
    message: "Call processing paused"
  });
});

exports.getSheetStatus = catchAsyncError(async (req, res) => {
  const { agent_id } = req.query;
  const user_id = req.user.id;

  const config = await SheetConfig.findOne({ agent_id, is_active: true });
  if (!config) {
    return res.status(400).json({
      success: false,
      message: "No active sheet configuration found"
    });
  }

  res.status(200).json({
    success: true,
    status: config.status,
    current_row: config.current_row,
    total_rows: config.total_rows,
    processed_rows: config.processed_rows,
    successful_calls: config.successful_calls,
    failed_calls: config.failed_calls,
    progress: config.progress,
    last_processed_time: config.last_processed_time,
    error_message: config.error_message
  });
});

exports.resetSheet = catchAsyncError(async (req, res) => {
  const { agent_id } = req.body;
  const user_id = req.user.id;

  const config = await SheetConfig.findOne({ agent_id, is_active: true });
  
  if (!config) {
    return res.status(400).json({
      success: false,
      message: "No active sheet configuration found"
    });
  }

  // Get agent details and reset the sheet_calls_active flag
  const agent = await AiAgent.findById(agent_id);
  

  // Get total rows from sheet
  const rows = await googleSheetsService.readRows(
    config.spreadsheet_id,
    `${config.sheet_name}!A:Z`
  );
  
  // Reset configuration
  config.current_row = 2; // Start from row 2 (after headers)
  config.is_active = true;
  config.status = 'idle';
  config.total_rows = rows.length - 1; // Subtract 1 for header row
  config.processed_rows = 0;
  config.successful_calls = 0;
  config.failed_calls = 0;
  config.error_message = null;
  config.last_error_time = null;
  config.last_processed_time = null;
  
  await config.save();

  res.status(200).json({
    success: true,
    message: "Sheet configuration reset successfully",
    config
  });
});

exports.getSheetConfig = catchAsyncError(async (req, res) => {
  const { agent_id } = req.query;
  const user_id = req.user.id;

  const config = await SheetConfig.findOne({ agent_id, is_active: true });
  if (!config) {
    return res.status(200).json({
      success: false,
      message: "No active sheet configuration found"
    });
  }

  let headers;
  try{
    headers = await googleSheetsService.getHeaders(
      config.spreadsheet_id,
      config.sheet_name
    );
  }catch (error) {
  }

  res.status(200).json({
    success: true,
    config: {
      spreadsheet_id: config.spreadsheet_id,
      sheet_name: config.sheet_name,
      column_mappings: config.column_mappings,
      mapped: config.mapped,
      headers
    }
  });
});

exports.processNextCall = catchAsyncError(async (req, res) => {
  const { agentId } = req.body;
  const agent = await AiAgent.findById(agentId);
  if (!agent) {
    return res.status(400).json({
      success: false,
      message: "Agent not found",
    });
  }

  // Find the active sheet configuration for this agent
  const config = await SheetConfig.findOne({
    agent_id: agentId,
    is_active: true
  });

  if (!config) {
    return res.status(400).json({
      success: false,
      message: "No active sheet configuration found for this agent",
    });
  }

  // Get the next row to process
  const row = await getNextRow(config);
  if (!row) {
    return res.status(400).json({
      success: false,
      message: "No more rows to process",
    });
  }

  // Make the call
  const response = await makeCall(agent, row.phone);
  if (!response.success) {
    return res.status(400).json({
      success: false,
      message: response.message,
    });
  }

  // Update the current row in the configuration
  config.current_row = row.row_number;
  await config.save();

  res.status(200).json({
    success: true,
    message: "Call initiated successfully",
    data: {
      call_id: response.request_uuid,
      row_number: row.row_number
    }
  });
});

async function processNextCall(config, agent) {
  try {
    // Store the original base prompt
    const originalBasePrompt = agent.base_prompt;

    while (config.status === 'processing') {
      // Refresh config from database
      const freshConfig = await SheetConfig.findById(config._id);
      if (!freshConfig || freshConfig.status !== 'processing') {
        break;
      }

      // Get next row
      const row = await googleSheetsService.getNextRow(
        config.spreadsheet_id,
        config.sheet_name,
        config.current_row
      );

    

      if (!row) {
        config.status = 'completed';
        await config.save();
        break;
      }

      // Get customer name and context from the row
      const customerName = row[Object.keys(config.column_mappings)
        .find(key => key.includes('customer name'))?.replace(/[<>]/g, '')];
      const context = row[Object.keys(config.column_mappings)
        .find(key => key.includes('context'))?.replace(/[<>]/g, '')];

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
        const sipCallId = await createSIPParticipant(phoneNumber, agent.plivo_phone_number, phoneRecord.sip_outbound_trunk_id, agent._id, customerName,context,callId,true);
        // Create a new CallHistory record with all required fields
        const callHistory = new CallHistory({
          caller_id: sipCallId,
          user_id: agent.user_id,
          agent_id: agent._id,
          voice_name: agent.voice_name,
          voice_engine_id: "-",
          chatgpt_model: agent.chatgpt_model,
          voice_id: agent.voice_id,
          plivo_phone_number: phoneNumber,
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