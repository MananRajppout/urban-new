const catchAsyncError = require("../middleware/catchAsyncError");
const { PricePlan, PaymentHistory, CreditCard, VoiceBilling, VoiceAIPricePlan } = require("../pricing/model");
const { updatePricingPlan, getPricingPlan, updateUser, getPricingPlanAiVoice, getCurrentPlan, getPlanDetails, deletePricingPlan } = require("../user/impl");
const { User, Restriction } = require("../user/model");
const { sendMailFun } = require("../utils/infra");
const { PlivoPhoneRecord } = require("../v2/model/plivoModel");
const { buyNumberFunction, deletePhoneNumberPlan, makePlivoNumberActive, deletePlivoNumberPaymentFailed } = require("../v2/utils");
const { handleSubscriptionCancellation, getThisMonthBilling, updatePaymentHistory } = require("./impl");
const mongoose = require("mongoose");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// some helper function
async function getStripeCustomerID(user) {
  if (!user.customer_payment_id) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id
      }
    })
    user.customer_payment_id = customer.id;
    await user.save()
  }
  return user.customer_payment_id;
}

exports.editPriceModel = catchAsyncError(async (req, res, next) => {
  try {
    const { pricePlanId } = req.query;
    const updatedPricePlanData = req.body; // Updated details in the request body

    // Use Mongoose to find and update the PricePlan
    const updatedPricePlan = await PricePlan.findByIdAndUpdate(
      pricePlanId,
      updatedPricePlanData,
      { new: false }
    );

    if (!updatedPricePlan) {
      return res.status(400).json({ error: "PricePlan not found" });
    }

    return res.status(200).json({ message: "success", updatedPricePlan });
  } catch (error) {
    console.error("Error updating PricePlan:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.fetchPriceModels = catchAsyncError(async (req, res, next) => {

  try {
    // Use Mongoose to query the database and fetch all PricePlan documents
    const pricePlans = await PricePlan.find().sort({ created_time: 1 });

    // Return the list of PricePlan entries as a JSON response
    return res.status(200).json({ message: "success", pricePlans });
  } catch (error) {
    console.error("Error fetching PricePlans:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.fetchAIPriceModels = catchAsyncError(async (req, res, next) => {
  try {
    // Use Mongoose to query the database and fetch all PricePlan documents
    const pricePlans = await VoiceAIPricePlan.find().sort({ created_time: 1 });


    // Return the list of PricePlan entries as a JSON response
    return res.status(200).json({ message: "success", pricePlans });
  } catch (error) {
    console.error("Error fetching PricePlans:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


const generateUniqueId = (length = 16) => {
  
  const timePart = Date.now().toString(36);


  const randomPart = Math.random().toString(36).substr(2, length - timePart.length);


  return timePart + randomPart;
};


// let TEST_CLOCK_ID = null;
exports.createStripeSession = catchAsyncError(async (req, res, next) => {
  let { pricing_plan_id, currency, country_iso } = req.body;





  // Controller Code
  const planDetails = await getPlanDetails(pricing_plan_id, country_iso);

  pricing_plan_id = pricing_plan_id ? pricing_plan_id :generateUniqueId(18)
  const { plan, planType } = planDetails;


  console.log(plan, planType, 'check for plan type here>>>>>>>>>>>>')

  if (!planDetails) {
    return res.status(404).json({ message: "Plan not found", success: false });
  }


  //this code is local testing plz comment of on production 
  // const testClock = await stripe.testHelpers.testClocks.create({
  //   frozen_time: Math.floor(Date.now() / 1000),
  // });
  // TEST_CLOCK_ID = testClock.id;
  // console.log(testClock,'check for test clocl',TEST_CLOCK_ID)

  //=============================== user current plan check here=================================
  //   let  user_plan_id ;
  //    user_plan_id = await getPricingPlan(req.user.id);
  //   if(!user_plan_id){
  //     user_plan_id=await getPricingPlanAiVoice(req.user.id);
  //   }

  //================uncomment this code if user not purchase same plan again i think it batter purchase again for adding more minutes======
  // const current_planId=  await getCurrentPlan(req.user.id,planType)
  // console.log(current_planId,pricing_plan_id)
  // //user want to more minutes in same month that why this code is comment
  // if (current_planId=== pricing_plan_id) {
  //   return res.status(409).json({
  //     message: `You already have this ${planType} subscription`,
  //     success: false,
  //   });
  // }

  // console.log(user_plan_id,'check for user plan id')

  // Stripe customer ID check
  if (!req.user.customer_payment_id) {
    const customer = await stripe.customers.create({
      email: req.user.email,
      metadata: { userId: req.user.id },
  

    });
    req.user.customer_payment_id = customer.id;
    await req.user.save();
  }

  const historyId= generateUniqueId(17);
  // Plan description here
  var plan_description = plan.period === "month" ? "Billed monthly" : "Billed yearly";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "inr",
          unit_amount: Math.round(plan.cost * 100),
          product_data: {
            name: plan.name,
            description: plan_description,
          },
          recurring: plan.period ? { interval: plan.period } : { interval: "month" },
        },
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    // customer: req.user.customer_payment_id,

    subscription_data: {
      metadata: {
        userId: req.user.id,
        planType: planType,
        plan_id: pricing_plan_id,
        unique_id:historyId

      },
      trial_settings: {
        end_behavior: {
          missing_payment_method: "create_invoice",
        },
      },
    },


    success_url: `https://backend.urbanchat.ai/api/stripe-success-callback?session_id={CHECKOUT_SESSION_ID}&plan_type=${planType}&country&countryISO=${country_iso}`,
    // success_url: `http://localhost:4000/api/stripe-success-callback?session_id={CHECKOUT_SESSION_ID}&plan_type=${planType}&country&countryISO=${country_iso}`,


    // success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}&plan_type=${planType}`,

    cancel_url: `https://backend.urbanchat.ai/api/stripe-failure-callback?session_id={CHECKOUT_SESSION_ID}`,
  });

  // Payment history save
  await PaymentHistory.create({
    user_id: req.user.id,
    currency: "inr",
    cost: plan.cost,
    plan_id: pricing_plan_id,
    stripe_session_id: session.id,
    plan_type: planType,
    country_iso: country_iso ? country_iso : "",
    unique_id:historyId
   

  });

  return res.status(200).json({
    message: "success",
    stripeSessionId: session.id,
    planType: planType,
    success: true,
  });
});


//this code is for recurring method testing locally plz comment off this code in production

// setInterval(async () => {
//   if (TEST_CLOCK_ID) {
//     const newTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 31; // +1 month
//    console.log(TEST_CLOCK_ID)
//     try {
//       const result = await stripe.testHelpers.testClocks.advance(TEST_CLOCK_ID,{

//         frozen_time: newTime,
//       });
//       console.log(`⏩ Clock advanced to: ${new Date(result.frozen_time * 1000).toISOString()}`);
//     } catch (err) {
//       console.error("Failed to advance test clock:", err.message);
//     }
//   } else {
//     console.log("⚠️ Test clock not initialized yet...");
//   }
// }, 10* 1000);

// ================================= -- new code====================================
exports.stripeSuccessCallback = catchAsyncError(async (req, res, next) => {
  const { session_id, plan_type } = req.query;



  // Payment history fetch
  const payment_history = await PaymentHistory.findOne({
    stripe_session_id: session_id,
  });
  if (!payment_history) {
    return res
      .status(404)
      .json({ message: "Payment record not found", success: false });
  }

  // Plan details fetch
  let paid_plan;
  if (plan_type === "chatbot") {
    paid_plan = await PricePlan.findById(payment_history.plan_id);
  } else if (plan_type === "ai_voice") {
    paid_plan = await VoiceAIPricePlan.findById(payment_history.plan_id);
  } else if (plan_type === "buy_number") {
    paid_plan = "buy_number"
  }

  if (!paid_plan) {
    return res
      .status(404)
      .json({ message: "Plan details not found", success: false });
  }

  // Stripe session verify karna
  const session = await stripe.checkout.sessions.retrieve(session_id);
  if (session.payment_status === "paid") {
    // Payment status update
    payment_history.payment_status = "paid";
    await payment_history.save();
    

    if (paid_plan === "buy_number") {

      console.log("Buying number")
      await buyNumberFunction(payment_history.user_id, payment_history.country_iso, payment_history.plan_id, session_id);
    } else {
      await updatePricingPlan(payment_history.user_id, paid_plan, plan_type);

    }
  }

  // User fetch
  const user = await User.findById(payment_history.user_id);

  // Payment details
  const pay_amount = `${payment_history.cost} ${payment_history.currency}`;

  const ctx = {
    pay_amount,
    subscription_plan: paid_plan.name,
    payment_date: new Date(paid_plan.created_time).toLocaleDateString(),
  };

  // Confirmation email bhejna
  await sendMailFun("payment_confirmation", ctx, user.email);

  // Redirect user to success page

  return res.redirect(
    `https://urbanchat.ai/success?plan_type=${plan_type}`
  );
  // return res.redirect(`https://localhost:3000/
  // ?plan_type=${plan_type}`)
});


exports.stripeFailedCallback = catchAsyncError(async (req, res, next) => {
  const { session_id } = req.query;
  const payment_history = await PaymentHistory.findOne({ stripe_session_id: session_id });
  payment_history.payment_status = "failed"
  await payment_history.save()

  return res.redirect("https://urbanchat.ai/pricing");
});



exports.stripeWebhook = catchAsyncError(async (request, response, next) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env["STRIPE_WEBHOOK_ENDPOINT_SECRET"]
    );
  } catch (err) {
    console.error(' Stripe webhook error:', err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    //  Subscription Cancelled
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await handleSubscriptionCancellation(subscription);
      console.log(' Subscription cancelled:', subscription.id);
      break;
    }

    //  Subscription Created
    case 'customer.subscription.created': {
      const subscr = event.data.object;

      const res = await stripe.subscriptions.retrieve(subscr.id, {
        expand: ['default_payment_method'],
      });
      const subscriptionData = {
        planType: res.metadata.planType,
        planId: res.metadata.plan_id,
        subscriptionId: res.id,
        startDate: new Date(res.current_period_start * 1000),
        current_period_end: new Date(res.current_period_end * 1000),
        unique_id: res.metadata.unique_id
      };
      
      // Step 1: Remove old subscription with same planId
      await User.findByIdAndUpdate(
        res.metadata.userId,
        {
          $pull: { subscriptions: { planId: res.metadata.plan_id } }
        }
      );
      
      // Step 2: Push new subscription
      await User.findByIdAndUpdate(
        res.metadata.userId,
        {
          $push: { subscriptions: subscriptionData }
        },
        { new: true }
      );
      

      break;
    }

    //  Invoice Payment Succeeded (Recurring)
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      const paymentIntentId = invoice.payment_intent;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const uniqueId = subscription.metadata.unique_id; 
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const paymentMethodId = paymentIntent.payment_method;
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
    const nextPaymentTimestamp = subscription.current_period_end;
    const nextPaymentDate = new Date(nextPaymentTimestamp * 1000);

      const foundUser = await User.findOne(
        { "subscriptions.subscriptionId": subscriptionId },
        { _id: 1, email: 1, "subscriptions.$": 1 }
      );

      if (!foundUser) {
        console.error("User not found for subscription:", subscriptionId);
        break;
      }

      const userId = foundUser._id.toString();
      const planId = foundUser.subscriptions[0].planId;
      const planType = foundUser.subscriptions[0].planType;
      // Only handle auto-renewal invoices

      const result = await updatePaymentHistory({
        planId,
        planType,
        paymentMethod,
        invoice,
        uniqueId,
        userId,
        nextPaymentDate
      });
      
      if (invoice.billing_reason === "subscription_cycle" ||invoice.billing_reason==="manual") {
        await stripe.subscriptions.update(subscriptionId
          , {
            cancel_at_period_end: false,
          });

    

        let current_plan;

        if (planType === "chatbot") {
          current_plan = await PricePlan.findById(planId);
        } else if (planType === "ai_voice") {
          current_plan = await VoiceAIPricePlan.findById(planId);
        }

        //  Call correct function based on plan type
        if (planType === "buy_number") {
          const res = await makePlivoNumberActive(planId, userId)

        } else {
          await updatePricingPlan(userId, current_plan, planType);
        }

        //  Store payment info
        const priceInRupees = invoice.amount_paid / 100;
        const payment_history = await PaymentHistory.create({
          user_id: userId,
          currency: "inr",
          cost: priceInRupees,
          plan_id: planId,
          plan_type: planType,
        });

        //  Send email
        const pay_amount = `${payment_history.cost} ${payment_history.currency}`;
        const paid_plan = await PlanModel.findById(planId); // Make sure this is fetched

        const ctx = {
          pay_amount,
          subscription_plan: paid_plan?.name || "Your Plan",
          payment_date: new Date(payment_history.createdAt).toLocaleDateString(),
        };

        await sendMailFun("payment_confirmation", ctx, foundUser.email);

        console.log(" Subscription renewed & DB updated (Recurring)");
      } else {
        console.log(" First-time payment, skipping recurring updates.");
      }

      break;
    }

    
    //  Payment Failed
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      const attempt_count = invoice.attempt_count;
      const paymentIntentId = invoice.payment_intent;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const uniqueId = subscription.metadata.unique_id; 
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const paymentMethodId = paymentIntent.payment_method;
      let paymentMethod =null;

      if(paymentMethodId){
        paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      }
      




      const foundUser = await User.findOne(
        { "subscriptions.subscriptionId": subscriptionId },
        { _id: 1, email: 1, "subscriptions.$": 1 }
      );

      if (!foundUser) {
        console.error("User not found for subscription:", subscriptionId);
        break;
      }

      let userId = foundUser._id.toString();
      let planId = foundUser.subscriptions[0].planId;
      let planType = foundUser.subscriptions[0].planType;

   const result = await updatePaymentHistory({
        planId,
        planType,
        paymentMethod,
        invoice,
        uniqueId,
        userId,
        paymentIntent
      });

      if (attempt_count === 1) {
        await stripe.subscriptions.update(subscriptionId
          , {
            cancel_at_period_end: true,
          });


        if (planType === "buy_number") {

          await deletePhoneNumberPlan(userId, planId);
        } else {
          await deletePricingPlan(userId, planId, planType);
        }
      }

      if (attempt_count >= 4) {
        const objectUserId = mongoose.Types.ObjectId.isValid(userId) ? mongoose.Types.ObjectId(userId) : null;

        //  Delete Stripe Subscription
        await stripe.subscriptions.cancel(subscriptionId);

        if (planType === "buy_number") {
          //  Delete from PlivoPhoneRecord
          deletePlivoNumberPaymentFailed(planId,objectUserId,subscriptionId)
        

        } else {
          //  Remove from user's subscriptions array
          const update = await User.updateOne(
            { _id: objectUserId },
            {
              $pull: {
                subscriptions: { planId: planId },
              },
            }
          );
        }
      }


      break;
    }


    default: {
      console.log(` Unhandled event type: ${event.type}`);
      break;
    }
  }

  response.status(200).end();
});

exports.addPaymentMethods = catchAsyncError(async (req, res, next) => {
  var is_default = false;
  const { payment_method_id, last4_card_number, expiry_month, expiry_year,name } = req.body;
  const customer_id = await getStripeCustomerID(req.user);

  const alreadyDefaultCard = await CreditCard.findOne({ user_id: req.user.id, is_default: true, customer_id }).exec();;
  if (!alreadyDefaultCard) {
    is_default = true;
  }

  await CreditCard.create({
    user_id: req.user.id, is_default,
    payment_method_id,
    last4_card_number,
    expiry_month, expiry_year,
    customer_id,
    name:name
  });
  return res.status(200).json({ success: true, message: "Payment method added", payment_method_id });
});

exports.makeDefaultCard = catchAsyncError(async (req, res, next) => {
  const { card_id } = req.body;

  const objectId =new mongoose.Types.ObjectId(card_id);
  await CreditCard.updateMany(
    { user_id: req.user.id },
    { $set: { is_default: false } }
  );

  await CreditCard.updateOne(
    { _id: objectId },
    { $set: { is_default: true } }
  );

  return res.status(200).json({ success: true, message: "Default card added", card_id });
});

exports.getPaymentMethods = catchAsyncError(async (req, res, next) => {
  var response = [];
  if (req.user.customer_payment_id) {
    response = await CreditCard.find({ customer_id: req.user.customer_payment_id, soft_delete: false });
  }
  return res.status(200).json({ success: true, message: "Success", payment_methods: response });
});



exports.deletePaymentMethod = catchAsyncError(async (req, res, next) => {
  const { card_id } = req.body;

  // Check if card_id is provided
  if (!card_id) {
    return res.status(400).json({ success: false, message: "Card ID is required" });
  }

  try {
    var creditCard = await CreditCard.findOne({ _id: card_id, user_id: req.user.id });

    // If credit card is not found, return a 404 response
    if (!creditCard) {
      return res.status(404).json({ success: false, message: "Credit card not found" });
    }

    creditCard.soft_delete = true;
    await creditCard.save()
    return res.status(200).json({ success: true, message: "Card remove successfully" });

  } catch (error) {
    return res.status(301).json({ success: false, message: "Request not permitted" });
  }
});



exports.getVoiceBilling = catchAsyncError(async (req, res, next) => {
  const page = req.query.page || 1;
  const per_page = req.query.per_page || 10;

  await getThisMonthBilling(req.user.id);

  const billings = await VoiceBilling.find({ user_id: req.user.id })
    .sort({ created_time: -1 })
    .skip((page - 1) * per_page)
    .limit(parseInt(per_page));

  return res.status(200).json({ success: true, message: "Billing History", billings });
});



//download invoice api add here 
//download stripe invoice
exports.downloadInvoice = catchAsyncError(async (req, res, next) => {
  try {
    const { sessionId } = req.query;

    // Retrieve the session details using session ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || !session.invoice) {
      return res.status(404).json({
        success: false,
        message: "No invoice found for this session",
      });
    }

    //  Retrieve invoice details using invoice ID from session
    const invoice = await stripe.invoices.retrieve(session.invoice);

    res.json({ success: true, Url: invoice.hosted_invoice_url });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


exports.currentPlan = catchAsyncError(async (req, res, next) => {


  console.log(req.user.id)
  // Fetch current plans from both collections
  const user = await User.findById(req.user.id);
  console.log(user);

  // const aiPricingPlan = await AiPricingPlan.findOne({ _id:user.ai_price_plan_id});
  let pricingPlan = null;
  if (user.pricing_plan) {
    pricingPlan = await PricePlan.findOne({ _id: user.pricing_plan.toString() });
  }

  const restriction = await Restriction.findOne({user_id: user._id});
  const minutesRemaining = Math.max(
    0,
    restriction.voice_trial_minutes_limit -
      restriction.voice_trial_minutes_used
  );

  let aiPricingPlan = null;
  let phoneNUmberPlan=null;
  if (user.ai_price_plan_id) {
    const planDoc = await VoiceAIPricePlan.findOne({ _id: user.ai_price_plan_id.toString() });
    const paymentId = user.subscriptions.find(sub => sub.planId === user.ai_price_plan_id?.toString())?.unique_id;
    const paymentHistory = await PaymentHistory.findOne({ unique_id: paymentId });
  
    if (planDoc && paymentHistory) {
      aiPricingPlan = planDoc.toObject(); 
      aiPricingPlan.next_payment = paymentHistory.next_payment;
      aiPricingPlan.payment_method = paymentHistory.payment_method;
    }
  }
  



  return res.status(200).json({ success: true, pricingPlan, aiPricingPlan,phoneNUmberPlan,minutesRemaining });
});



//paid duer amount for phone number updates here >>>>>>>>>>>
exports.checkSubscriptionDue = async (req, res) => {
  const user_id = req.user._id; //  user_id from session
  const { planId } = req.query;

  try {
    const user = await User.findOne(
      { _id: user_id, "subscriptions.planId": planId },
      { "subscriptions.$": 1 }
    );

    if (!user || !user.subscriptions?.length) {
      return res.status(404).json({
        success: false,
        message: "No subscription found for this plan.",
      });
    }

    const subscriptionId = user.subscriptions[0].subscriptionId;

    if (!subscriptionId) {
      return res.status(404).json({
        success: false,
        message: "Subscription ID missing.",
      });
    }

  

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const invoiceId = subscription.latest_invoice;

    if (!invoiceId) {
      return res.status(404).json({
        success: false,
        message: "No invoice found for this subscription.",
      });
    }

    let invoice = await stripe.invoices.retrieve(invoiceId);

    //  If invoice is draft, finalize it to get hosted_invoice_url
    if (invoice.status === "draft") {
      invoice = await stripe.invoices.finalizeInvoice(invoiceId);
    }
    console.log(invoiceId,invoice,'check for invoice here bro')

    //  Now check if invoice is still due
    if (["open", "uncollectible"].includes(invoice.status)) {
      return res.status(200).json({
        success: true,
        paymentDue: true,
        hosted_invoice_url: invoice.hosted_invoice_url,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        status: invoice.status
      });
    } else {
      return res.status(200).json({
        success: true,
        paymentDue: false,
        message: "Invoice already paid or closed.",
        status: invoice.status
      });
    }

  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};




//get payment histroy here for billing
exports.getPaymentHistory = catchAsyncError(async (req, res) => {
  try {
    const { start_date, end_date, page = 1 } = req.query;
    const itemsPerPage = 5;

    const userId = req.user.id; // User ID from session/middleware
    const filter = { user_id: userId }; // Filter by user_id

    if (start_date || end_date) {
      filter.created_time = {};
      if (start_date) {
        filter.created_time.$gte = new Date(start_date);
      }
      if (end_date) {
        filter.created_time.$lte = new Date(end_date);
      }
    }

    const totalRecords = await PaymentHistory.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    const payments = await PaymentHistory.find(filter)
      .sort({ created_time: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalRecords,
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
});






exports.editPaymentMethods = catchAsyncError(async (req, res, next) => {
  const { payment_method_id, last4_card_number, expiry_month, expiry_year, name,id } = req.body;
  console.log(req.body,'check for id bro ')


  const card = await CreditCard.findById(id);

  console.log(card,'check for card')
  if (!card) {
    return res.status(404).json({ success: false, message: "Payment method not found" });
  }

  // Update fields if provided
  if (last4_card_number) card.last4_card_number = last4_card_number;
  if (expiry_month) card.expiry_month = expiry_month;
  if (expiry_year) card.expiry_year = expiry_year;
  if (name) card.name = name;

  await card.save();

  return res.status(200).json({ success: true, message: "Payment method updated", payment_method_id });
});

