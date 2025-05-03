
// const { Configuration, OpenAIApi } = require("openai");
// require('dotenv').config()

// // const configuration = new Configuration({
// //   apiKey: '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',
// // });



// const messageList = [];

// async function runCompletion () {
//     const openai = new OpenAIApi({
//         api_key: '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'
//     });
//     messageList.push({ role: "user", content: 'Hello World, how are you' });
//     const GPTOutput = await openai.createChatCompletion({
//             model: "gpt-3.5-turbo",
//             messages: messageList,
//         });
//     const output_text = GPTOutput.data.choices[0].message.content;
//     console.log(output_text);
// }

// runCompletion();




const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

// const configuration = new Configuration({
//   apiKey: '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',
// });



// const messageList = [];

// async function runCompletion () {
//     const openai = new OpenAIApi({
//         api_key: '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'
//     });
//     messageList.push({ role: "user", content: 'Hello World, how are you' });
//     const GPTOutput = await openai.createChatCompletion({
//             model: "gpt-3.5-turbo",
//             messages: messageList,
//         });
//     const output_text = GPTOutput.data.choices[0].message.content;
//     console.log(output_text);
// }

// runCompletion();


const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: "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"
});
const openFun=async()=>{
const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{"role": "user", "content": "hello world",}],
  });
  console.log(chatCompletion.choices[0].message.content);
}
openFun();


// STREAM CODE 

// const payloads = chunk.toString().split("\n\n");
// 			for (const payload of payloads) {
// 			  if (payload.includes('[DONE]')) {
// 				// Close the response when done streaming
// 				res.end();
// 				return;
// 			  }
// 			  if (payload.startsWith("data:")) {
// 				const data = JSON.parse(payload.replace("data: ", ""));
// 				try {
// 				  const chunkText = data.choices[0].delta?.content;
// 				  if (chunkText) {
// 					// Send the chunk of data to the frontend
					
// 				  }
// 				} catch (error) {
// 				  console.log(`Error with JSON.parse and ${payload}.\n${error}`);
// 				}
// 			  }
// 			}

	// stream.on('data', (chunk) => {
		// 	const payloads = chunk.toString().split("\n\n");
		// 	for (const payload of payloads) {
		// 		if (payload.includes('[DONE]')) return;
		// 		if (payload.startsWith("data:")) {
		// 			const data = JSON.parse(payload.replace("data: ", ""));
		// 			try {
		// 				const chunkText = data.choices[0].delta?.content;
		// 				if (chunkText) {
		// 					console.log(chunkText);
		// 				}
		// 			} catch (error) {
		// 				console.log(`Error with JSON.parse and ${payload}.\n${error}`);
		// 			}
		// 		}
		// 	}
    	// });

		// stream.on('end', () => {
		// 	setTimeout(() => {
		// 		console.log('\nStream done');
		// 		// Replace with your response handling logic
		// 	}, 10);
		// });

		// stream.on('error', (err) => {
		// 	console.log("while doing the chat-completion for chatbot_id",chatbot_id," error: ",err);
		// 	// Handle the error (e.g., send an error response)
		// });
		//return res.status(200).json({ message: completion.choices[0].message.content});