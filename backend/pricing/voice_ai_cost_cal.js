/*
The process to calculate pricing for each user will involve the following steps:

New Models:
- VoiceAICharge (type: enum['daily_call', 'ph_number'])

Current Model Changes:
- CallHistory: (cost: $ in Dollar)

Two cron jobs will be running:
	(i) Calculate the end_time for CallHistory and compute the cost for each call.
	(ii) Perform the following tasks:
		- Work [Pick_Phone_numbers]: (Buy from our platform) -> pick CallHistory (from: time.now - 30 mins to: now - 24 hours).

Additional Steps:
	(iii) Create VoiceAICharge objects corresponding to the chosen phone numbers (pick_phone_numbers).
	(iv) Apply to user's payment method
	(v) Moniter the cron's activity in the admin dashboard
    
*/

const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const { CallSessionLogs, CallHistory, TelnyxPhoneRecord, VoiceAiInvoice } = require("../voice_ai/model");
const { get_llm_cost_per_sec, get_stt_cost_per_sec, get_voice_engine_cost_per_sec, get_twilio_cost_per_sec, get_telnyx_cost_per_sec } = require("./voice_ai_pricing");
const { User } = require("../user/model");
const { CreditCard } = require("./model");
const { getStripeCustomerID } = require("./controller");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// cron for to update end_time
const callHistoryEndTimeSync = catchAsyncFunc(async () => {
	const now = new Date();
	const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000); // 1 day ago
	const oneHourAgo = new Date(now - 1 * 60 * 60 * 1000); // 1 hour ago

	await CallHistory.aggregate([
		// Step 1: Match documents within the specified time range
		{
			$match: {
				created_time: {
					$gte: oneDayAgo,
					$lte: oneHourAgo
				}
			}
		},
		// Step 2: Lookup latest VoiceSessionLogs for each caller_id
		{
			$lookup: {
				from: CallSessionLogs.collection.name,  // Replace with your actual collection name
				let: { caller_id: '$caller_id' },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$caller_id', '$$caller_id'] }
						}
					},
					{
						$sort: { created_time: -1 }  // Sort by created_time descending
					},
					{
						$limit: 1  // Limit to 1 document (latest)
					}
				],
				as: 'latestSessionLog'
			}
		},
		// Step 3: Update VoiceHistory documents with the end_time from latest VoiceSessionLogs
		{
			$addFields: {
				latestSessionLog: { $arrayElemAt: ['$latestSessionLog', 0] }
			}
		},
		{
			$set: {
				end_time: '$latestSessionLog.created_time'
			}
		}
	]).exec();
});

const callPriceCal = catchAsyncFunc(async () => {
	const now = new Date();
	const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000); // 1 day ago
	const oneHourAgo = new Date(now - 1 * 60 * 60 * 1000); // 1 hour ago

	const cursor = CallHistory.find({
		created_time: {
		  $gte: oneDayAgo,
		  $lte: oneHourAgo
		},
		caller_id: {
		  $regex: '^v3:'
		},
		$or: [
		  { cost: null },
		  { cost: 0.0 }
		]
	  }).cursor();
	  
	  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
		const telnyxCost = await getTelnyxPricingForCall(doc);
		doc.cost = telnyxCost;
		await doc.save();
	  }
});

async function getPricingForCall(histObj){
	var cost = 0;
	const differenceInMillis = histObj.end_time.getTime() - histObj.start_time.getTime();
	var callDuration = differenceInMillis / 1000;
	if (callDuration <= 1){
		callDuration = 2
	}

	cost += get_llm_cost_per_sec(histObj.chatgpt_model) * callDuration ;
	cost += get_voice_engine_cost_per_sec('elvenlabs') * callDuration ;
	
	// Note: the current logic expecting the number to be purchased from our platfrom, so in future, write the correct logic
	cost += get_twilio_cost_per_sec() * callDuration;
	return cost;
}

// Function to calculate costs for CallHistory where caller_id starts with 'v3:'
const calculateTelnyxCallCosts = catchAsyncFunc(async () => {
  console.log("Running cost calculation for CallHistory with caller_id starting with 'v3:'...");

  const batchSize = 10;  // You can adjust the batch size as needed
  const today = new Date();
  const oneDayAgo = new Date(today - 24 * 60 * 60 * 1000); // 1 day ago
  const oneHourAgo = new Date(today - 1 * 60 * 60 * 1000); // 1 hour ago

  // Fetch all CallHistory records where caller_id starts with 'v3:', and cost is null or 0.0
  const callHistoryObjs = await CallHistory.find({
    created_time: {
      $gte: oneDayAgo,
      $lte: oneHourAgo
    },
    caller_id: {
      $regex: '^v3:' // Regular expression to match caller_id starting with 'v3:'
    },
    $or: [
      { cost: null },
      { cost: 0.0 }
    ]
  });

  // If no records found, log and return
  if (callHistoryObjs.length === 0) {
    console.log("No CallHistory records found with caller_id starting with 'v3:' that require cost calculation.");
    return true;
  }

  const totalBatches = Math.ceil(callHistoryObjs.length / batchSize);

  // Process call histories in batches
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min((i + 1) * batchSize, callHistoryObjs.length);
    const callHistoryBatch = callHistoryObjs.slice(start, end);

    await Promise.all(callHistoryBatch.map(async (histObj) => {
      try {
        // Calculate the Telnyx cost for each call
        const telnyxCost = await getTelnyxPricingForCall(histObj);
        histObj.cost = telnyxCost;  // Assign the calculated cost
        await histObj.save();       // Save the updated call history
      } catch (error) {
        console.error(`Failed to calculate cost for CallHistory ID ${histObj._id}:`, error);
      }
    }));
  }

  console.log("Completed cost calculation for CallHistory with caller_id starting with 'v3:'.");
  return true;
});

async function getTelnyxPricingForCall(histObj){
	var cost = 0;
	const differenceInMillis = histObj.end_time.getTime() - histObj.start_time.getTime();
	var callDuration = differenceInMillis / 1000;
	if (callDuration <= 1){
		callDuration = 2
	}

	cost += get_llm_cost_per_sec(histObj.chatgpt_model) * callDuration ;
	cost += get_voice_engine_cost_per_sec('deepgram') * callDuration ;
	cost += get_stt_cost_per_sec('nova-2') * callDuration ;
	cost += get_telnyx_cost_per_sec() * callDuration ;

	return cost;
}

// TEMPORARY : once vishnu's code ready, we can do it
const phPriceCal = catchAsyncFunc(async () => {

});

// Function to sync users with negative voice AI credits
const voiceAICreditSync = catchAsyncFunc(async () => {
	// Fetch users with voice_ai_credits less than zero
	const usersWithNegativeCredits = await User.aggregate([
	  {
		$match: {
		  voice_ai_credits: { $lt: 0 } // Filter users with negative voice AI credits
		}
	  },
	  {
		$project: {
		  user_id: '$_id',         // Projecting the user_id (_id) field
		  full_name: 1,            // Projecting full_name
		  email: 1,                // Projecting email
		  voice_ai_credits: 1      // Projecting voice_ai_credits field
		}
	  }
	]).exec();
  
	// Log or process the results
	console.log('Users with negative Voice AI Credits:', usersWithNegativeCredits);
  
	// Optionally, take some action such as sending a notification or alert
	for (const user of usersWithNegativeCredits) {
		try {
			// Check for default payment card for the user
			const defaultCard = await CreditCard.findOne({ user_id: user.user_id, is_default: true }).exec();
			if (!defaultCard) {
				console.error(`No default card found for user ${user.user_id}`);
				continue; // Move to the next user if no default card is found
			}

			// Attach the payment method to the customer
			await stripe.paymentMethods.attach(defaultCard.payment_method_id, {
				customer: defaultCard.customer_id,
			});

			// Create a payment intent
			const paymentIntent = await stripe.paymentIntents.create({
				amount: Math.abs(user.voice_ai_credits) * 100, // amount in cents
				currency: 'usd',
				customer: defaultCard.customer_id,
				payment_method: defaultCard.payment_method_id,
				off_session: true,
				confirm: true,
			});

			// Create an invoice record in the database
			await VoiceAiInvoice.create({
				user_id: user.user_id,
				amount: Math.abs(user.voice_ai_credits),
				currency: 'usd',
				payment_intent_id: paymentIntent.id,
			});

			// Update the user's Voice AI credits to zero
			const userSchema = await User.findById(user.user_id);
			if (userSchema) {
				userSchema.voice_ai_credits = 0;
				await userSchema.save();
			} else {
				console.error(`User not found in the database with ID: ${user.user_id}`);
			}

			// Optionally, send an email alert
			// await sendEmailAlert(user.email, user.full_name, user.voice_ai_credits);
			console.log(`Processed user ${user.full_name} with email ${user.email}. Credits reset to zero.`);
		} catch (error) {
			// Log the error for debugging purposes
			console.error(`Failed to process user ${user.user_id}:`, error);
		}
	}
});

module.exports = {
	callHistoryEndTimeSync,
	callPriceCal,
	phPriceCal,
	getPricingForCall,
	calculateTelnyxCallCosts,
	getTelnyxPricingForCall,
	voiceAICreditSync
}