require("colors");
const EventEmitter = require("events");
const OpenAI = require("openai");
const tools = require("../functions/function-manifest-v2");

// Import all functions included in function manifest
// Note: the function name and file name must be the same
const availableFunctions = {};
tools.forEach((tool) => {
  let functionName = tool.function.name;
  availableFunctions[functionName] = require(`../functions/${functionName}`);
});

class GptJSONService extends EventEmitter {
  constructor() {
    super();
    this.openai = new OpenAI();
    this.userContext = [];
    this.partialResponseIndex = 0;
    this.voiceTemperature = 0.3;
    this.callSID = undefined;
    this.transferCallNumber = undefined;
  }

  // Add the callSid to the chat context in case
  // ChatGPT decides to transfer the call.
  setCallInfo(systemPrompt, voiceTemperature) {
    this.userContext[0] = {
      role: "system",
      content: systemPrompt,
    };
    this.voiceTemperature = voiceTemperature;
    // console.log("Info: ",this.userContext);
  }

  setTransferCallInfo(callSID, transferCallNumber) {
    this.callSID = callSID;
    this.transferCallNumber = transferCallNumber;
  }

  updateUserContext(name, role, text) {
    if (name !== "user") {
      this.userContext.push({ role: role, name: name, content: text });
    } else {
      this.userContext.push({ role: role, content: text });
    }
  }

  // ==================================================
  // ============== JSON IMPLEMENTATION
  // ==================================================

  async completionJSON(text, interactionCount, role = "user", name = "user") {
    if (text) {
      this.updateUserContext(name, role, text);
    }

    const response = await this.get_gpt_json_response();
    await this.gpt_response_json_action(response, interactionCount);
  }

  async get_gpt_json_response() {
    const gpt_parameters = {
      model: "gpt-4o-mini",
      temperature: this.voiceTemperature,
      messages: this.userContext,
      max_completion_tokens: 1500,
      response_format: { type: "json_object" },
    };

    // Step 1: Send user transcription to Chat GPT
    const response = await this.openai.chat.completions.create(gpt_parameters);
    return response;
  }

  async gpt_response_json_action(gptResponse, interactionCount) {
    let completeResponse = "";
    let partialResponse = "";
    let functionName = "";
    let functionArgs = "";

    console.log(gptResponse.choices[0]?.message?.content);
    const content = JSON.parse(gptResponse.choices[0]?.message?.content) || {};
    const { action, response } = content;

    if (action === "endCall" || action === "transferCall") {
      await this.jSONToolCall(action, response, interactionCount);
    } else if (action === "stop") {
      // We use completeResponse for userContext
      completeResponse = response;

      // We use partialResponse to provide a chunk for TTS
      partialResponse = response;

      // Emit last partial response and add complete response to userContext
      const gptReply = {
        partialResponseIndex: this.partialResponseIndex,
        partialResponse,
      };

      this.emit("gptreply", gptReply, interactionCount);
      this.partialResponseIndex++;
      partialResponse = "";
    }

    this.userContext.push({ role: "assistant", content: completeResponse });
    console.log(`GPT -> user context length: ${this.userContext.length}`.green);
  }

  async jSONToolCall(action, response, interactionCount) {
    console.log("gpt is calling the function: ", action);
    // parse JSON string of args into JSON object

    const responseToUser = response || "";
    this.emit(
      "funcgptreply",
      {
        partialResponseIndex: null,
        partialResponse: responseToUser, //Change with dynamic Message
      },
      {
        name: action,
      },
      interactionCount
    );
  }

  async validateAndCallJSONFunction(functionData) {
    const { name } = functionData;
    console.log("Validating function: ", name);

    const functionToCall = availableFunctions[name];
    const validatedArgs = {
      callSid: this.callSID,
      transferNumber: this.transferCallNumber,
    };

    let functionResponse = await functionToCall(validatedArgs);

    // Step 4: send the info on the function call and function response to GPT
    this.updateUserContext(functionName, "action", functionResponse);
  }
}

module.exports = { GptJSONService };
