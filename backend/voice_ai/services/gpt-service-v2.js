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

class GptService extends EventEmitter {
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

  validateFunctionArgs(args) {
    try {
      return JSON.parse(args);
    } catch (error) {
      console.log(
        "Warning: Double function arguments returned by OpenAI:",
        args
      );
      // Seeing an error where sometimes we have two sets of args
      if (args.indexOf("{") != args.lastIndexOf("{")) {
        return JSON.parse(
          args.substring(args.indexOf(""), args.indexOf("}") + 1)
        );
      }
    }
  }

  updateUserContext(name, role, text) {
    if (name !== "user") {
      this.userContext.push({ role: role, name: name, content: text });
    } else {
      this.userContext.push({ role: role, content: text });
    }
  }

  async completion(
    text,
    interactionCount,
    role = "user",
    name = "user",
    use_tools = true
  ) {
    if (text) {
      this.updateUserContext(name, role, text);
    }
    console.log("Simple Completion");
    const response = await this.get_gpt_response(use_tools);
    await this.gpt_response_action(response, interactionCount);
  }

  async get_gpt_response(use_tools) {
    const gpt_parameters = {
      model: "gpt-4o-mini",
      temperature: this.voiceTemperature,
      messages: this.userContext,
      max_completion_tokens: 1500,
    };

    if (use_tools) {
      gpt_parameters["tools"] = tools;
    }

    // Step 1: Send user transcription to Chat GPT
    const response = await this.openai.chat.completions.create(gpt_parameters);
    return response;
  }

  async gpt_response_action(response, interactionCount) {
    let completeResponse = "";
    let partialResponse = "";
    let functionName = "";
    let functionArgs = "";
    console.log(response);
    const content = response.choices[0]?.message?.content || "";
    const finishReason = response.choices[0].finish_reason;

    if (response.choices[0]?.message?.tool_calls) {
      const called_tool = response.choices[0]?.message?.tool_calls[0];
      functionName = called_tool?.function?.name;
      functionArgs = called_tool?.function?.arguments;
    }

    if (finishReason === "tool_calls") {
      await this.functionToolCall(functionName, functionArgs, interactionCount);
    } else if (finishReason === "stop") {
      // We use completeResponse for userContext
      completeResponse = content;

      // We use partialResponse to provide a chunk for TTS
      partialResponse = content;

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

  async functionToolCall(functionName, functionArgs, interactionCount) {
    console.log("gpt is calling the function: ", functionName);
    // parse JSON string of args into JSON object

    const functionToCall = availableFunctions[functionName];
    const validatedArgs = this.validateFunctionArgs(functionArgs);

    const responseToUser = validatedArgs?.response || "";
    this.emit(
      "funcgptreply",
      {
        partialResponseIndex: null,
        partialResponse: responseToUser, //Change with dynamic Message
      },
      {
        name: functionName,
        args: validatedArgs,
      },
      interactionCount
    );

    // We Don't need to call this function
    // await this.completion(
    //   functionResponse,
    //   interactionCount,
    //   "function",
    //   functionName
    // );
  }

  async validateAndCallFunction(functionData) {
    const { name, args } = functionData;
    console.log("Validating function: ", name);
    console.log("Validating function Arguments: ", args);
    const functionToCall = availableFunctions[name];
    const validatedArgs = args;

    let functionResponse = await functionToCall(validatedArgs);

    // Step 4: send the info on the function call and function response to GPT
    this.updateUserContext(functionName, "function", functionResponse);
  }
}

module.exports = { GptService };
