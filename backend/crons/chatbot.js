const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const { updateRestrictionWithPricing } = require("../user/impl");
const { User } = require("../user/model");

const renew_chat_credits = catchAsyncFunc(async () => {
	console.log("Running renew_chat_credits || ")
	const batchSize = 10;
	const today = new Date();
	const users = await User.find({
		$expr: {
			$and: [
				{ $eq: [{ $dayOfMonth: "$pricing_plan_applied" }, today.getDate()] },
				{ $or: [
					{ $ne: [{ $month: "$pricing_plan_applied" }, today.getMonth() + 1] },
					{ $ne: [{ $year: "$pricing_plan_applied" }, today.getFullYear()] }
				]}
			]
		}
	})

	const totalBatches = Math.ceil(users.length / batchSize);

	for (let i = 0; i < totalBatches; i++) {
		const start = i * batchSize;
		const end = Math.min((i + 1) * batchSize, users.length);
		const users_batch = users.slice(start, end); // A single batch


		await Promise.all(users_batch.map(async (user) => {
			updateRestrictionWithPricing(user._id)
		}));
	}

	console.log("Completed renew_chat_credits || ")
	return true;
});

module.exports = {
	renew_chat_credits
}