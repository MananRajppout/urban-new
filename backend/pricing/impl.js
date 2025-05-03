const { User } = require("../user/model");
const { PlivoPhoneRecord } = require("../v2/model/plivoModel");
const { VoiceBilling, PaymentHistory, VoiceAIPricePlan, PricePlan } = require("./model");

async function handleSubscriptionCancellation(subscription) {
    try {
        // Extract the customer ID from the subscription object
        const customerId = subscription.customer;

        // Find the user in your database linked to this customer ID
        const user = await User.findOne({ customer_payment_id: customerId });
        if (!user) {
            console.error('No user found for this customer ID:', customerId);
            return; // Exit if no user is found
        }

        // Nullify the 'pricing_plan' field so that the user redirected to free plan
        await User.updateOne({ _id: user.id }, { $unset: { pricing_plan: "" } });

        // duplicate key error collection will occur if we give null session id every time bcz it must be unique so comment this code once
        await PaymentHistory.create({
            user_id: user.id,
            plan_id: subscription.plan.id,
            payment_status: 'cancelled',
            currency: subscription.plan.currency,
            cost: subscription.plan.amount / 100,
        });

        console.log('Updated user after cancellation and logged the event.');
    } catch (error) {
        console.error('Error handling subscription cancellation:', error);
    }
}

async function getThisMonthBilling(user_id) {
    const now = new Date();
    const year = now.getFullYear();

    const startOfMonth = new Date(year, now.getMonth(), 1); // No -1 needed here
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999);

    var currMonthBill = await VoiceBilling.findOne({
        billing_date: {
            $gte: startOfMonth,
            $lte: endOfMonth
        }
    }).exec();

    if (!currMonthBill) {
        currMonthBill = await VoiceBilling.create({
            user_id,
            billing_date: startOfMonth,
        });
    }
    return currMonthBill
}





const updatePaymentHistory = async ({ planId, planType, paymentMethod, invoice, uniqueId, userId ,paymentIntent,nextPaymentDate}) => {
    let current_plan = null;



    const paymentHistory = await PaymentHistory.findOne({ unique_id: uniqueId, user_id: userId });

    if (!paymentHistory) {
        return { status: 'error', message: 'Payment history not found' };
    }

    // Set card details
    paymentHistory.payment_method.name = paymentMethod?.card?.display_brand || paymentHistory.payment_method.name;
    paymentHistory.payment_method.number = paymentMethod?.card?.last4 || paymentHistory.payment_method.number;

    // Set invoice details
    paymentHistory.invoice_url = invoice?.invoice_pdf || paymentHistory.invoice_url;
    paymentHistory.invoice_number = invoice?.number || "";
    if (invoice?.status === "paid") {
        //  Payment success
        paymentHistory.payment_status = 'paid';
        paymentHistory.next_payment=nextPaymentDate;
        paymentHistory.payment_decsription.reason = invoice?.billing_reason || "Payment succeeded";
    } else if (invoice?.status === "open" || invoice?.status === "uncollectible") {
        //  Payment failed
        const paymentError = paymentIntent?.last_payment_error;
        paymentHistory.payment_status = 'failed';
        paymentHistory.payment_decsription.reason = paymentError?.message || paymentError?.code || "Payment failed";
    }


    // Fetch and set plan title
    switch (planType) {
        case 'chatbot':
            current_plan = await PricePlan.findById(planId);
            paymentHistory.payment_decsription.title = current_plan?.name || '';
            break;

        case 'ai_voice':
            current_plan = await VoiceAIPricePlan.findById(planId);
            paymentHistory.payment_decsription.title = current_plan?.name || '';
            break;

        case 'buy_number':
            current_plan = await PlivoPhoneRecord.findOne({ plan_id: planId });
            paymentHistory.payment_decsription.title = current_plan?.phone_number || '';
            break;

        default:
            return { status: 'error', message: 'Invalid plan type' };
    }


    console.log(paymentHistory,'check here for payment histroy >>>')
    // Save updated history
    await paymentHistory.save();

    return {
        status: 'success',
        message: 'Payment history updated successfully',
        paymentHistory,
        current_plan
    };
};

module.exports = {
    handleSubscriptionCancellation,
    getThisMonthBilling,
    updatePaymentHistory
}