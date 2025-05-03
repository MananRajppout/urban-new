// const { getPricingPlan } = require('../chatbot/impl');
const bcrypt = require('bcryptjs');
const { Restriction, User } = require('./model');
const { PricePlan, VoiceAIPricePlan } = require("../pricing/model");
const { getCurrentTime, generateRandomPassword } = require('../utils/infra');

async function getPricingPlan(user_id) {
    //same code

    
    const user_obj = await User.findById(user_id).populate('pricing_plan');
    if (!user_obj.pricing_plan) { 
      const  pricing_plan = await PricePlan.findOne({name:'Free',period:"month"}); 
      return pricing_plan // Please remove this in production 
    }

    return user_obj.pricing_plan
  }
  

  async function getCurrentPlan(user_id,plan_type){
    const restriction = await Restriction.findOne({ id: user_id });
    if(plan_type==='chatbot'){
     return restriction.price_plan_id 
    }else{
      return restriction.ai_price_plan_id 
    }
  
  
  }
  async function getPricingPlanAiVoice(user_id) {

    const user_obj = await User.findById(user_id).populate('ai_pricing_plan');
    if (!user_obj.ai_pricing_plan) {
      const pricing_plan = await VoiceAIPricePlan.findOne({name:'Free',period:"month"});
      return pricing_plan ;
    }
    return user_obj.ai_pricing_plan
  }

async function establishRestriction(user_id) {

  console.log('check any eror bro')
    const pricing_plan = await getPricingPlan(user_id);
  

    var payload_restriction = {
        id: user_id,
        user_id: user_id,
        consumed_messages_user: 0,
        quota_messages_user: pricing_plan.messages_quota_user,
        price_plan_id: pricing_plan.id,
        

    }

    const restriction = await Restriction.create(payload_restriction);
    return restriction;
}

// For cron to renew the credits only
async function updateRestrictionWithPricing(user_id) {
    const pricing_plan = await getPricingPlan(user_id);
    const restriction = await getRestriction(user_id);

    restriction.quota_messages_user += pricing_plan.messages_quota_user;
    restriction.price_plan_id = pricing_plan.id;
    restriction.chat_credit_updated_on = new Date();
    await restriction.save()

    return true;
}

async function getRestriction(user_id) {
    const restriction = await Restriction.findOne({ id: user_id });
    if (!restriction) {
        return await establishRestriction(user_id);
    }
    return restriction;
}

async function updatePricingPlan(user_id, pricing_plan, planType) {
  const user = await User.findById(user_id);

  if (planType === 'ai_voice') {
    user.ai_price_plan_id = pricing_plan.id;
    user.ai_pricing_plan_applied = getCurrentTime();
    user.voice_ai_status = "active"
  } else if (planType === 'chatbot') {
    user.pricing_plan = pricing_plan.id
    user.pricing_plan_applied = getCurrentTime()
  }
  const restriction = await getRestriction(user_id);
  
  if (planType === 'ai_voice') {

    if (typeof restriction.voice_trial_minutes_limit !== 'number') {
      restriction.voice_trial_minutes_limit = 0;
    }


    restriction.voice_trial_minutes_limit += pricing_plan.total_minutes_balance;
    restriction.ai_price_plan_id = pricing_plan.id;
  } else if (planType === 'chatbot') {
    if (typeof restriction.quota_messages_user !== 'number') {
      restriction.quota_messages_user = 0;
    }
 
    restriction.quota_messages_user += pricing_plan.messages_quota_user;
    restriction.price_plan_id = pricing_plan.id;

  }

  await user.save()
  await restriction.save()

  return true;

}


async function deletePricingPlan(user_id, pricing_plan, planType) {
  const user = await User.findById(user_id);

  if (planType === 'ai_voice') {
    user.ai_price_plan_id = "";
    user.ai_pricing_plan_applied = "";
    user.voice_ai_status = "inactive"
  } else if (planType === 'chatbot') {
    user.pricing_plan = ""
    user.pricing_plan_applied = ""
  }
  const restriction = await getRestriction(user_id);
  if (planType === 'ai_voice') {
  
    restriction.ai_price_plan_id = "";
  } else if (planType === 'chatbot') {
    restriction.price_plan_id = "";
  }

  await user.save()
  await restriction.save()

  return true;

}

//this code is causes issues that's why commnet

// async function getPricingPlan(user_id, planType) {
//     const user_obj = await User.findById(user_id);
  
//     if (
//       !user_obj ||
//       !user_obj.pricing_plans ||
//       !user_obj.pricing_plans[planType]
//     ) {
//       return null;
//     }
  
//     const user_plan_id = user_obj.pricing_plans[planType]?.plan_id?.toString();
  
//     let current_plan;
//     if (planType === "chatbot") {
//       current_plan = await PricePlan.findById(user_plan_id);
//     } else if (planType === "ai_voice") {
//       current_plan = await VoiceAIPricePlan.findById(user_plan_id);
//     }
//     return current_plan;
//   }
  

async function updateUser(user_id, update_object) {
    await User.updateMany({ _id: user_id }, { $set: update_object });
    return true
}


/**
 * Creates a new user for a specific organization, validating the required fields.
 * @param {String} org_id - The ID of the organization to associate the user with.
 * @param {Object} payload - The user data to create a new user.
 * @returns {Promise<Object>} - The newly created user object.
 * @throws {Error} - Throws an error if any required field is missing.
 */
async function createOrgUser(org_id, payload) {

    console.log("this is createOrgUser result",payload);
    // List of required fields
    const required_fields = ['email', 'full_name', 'role_id', 'country_code', 'phone_number'];

    // Validate that all required fields are provided in the payload
    for (const field of required_fields) {
        if (!payload[field]) {
            return [`Missing required field: ${field}`, false]
        }
    }

    let user = await User.findOne({
        $or: [{ email: payload.email }]
    });
    if (user) {
        return ["User already exists", false]
    }

    const password = generateRandomPassword(); // Generate a random password (12 characters long)

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Proceed with creating the new user in the database
    const newUser = new User({
        org_id: org_id,
        email: payload.email,
        full_name: payload.full_name,
        role_id: payload.role_id,
        country_code: payload.country_code,
        phone_number: payload.phone_number,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    // Save the new user to the database
    await newUser.save();

    return [newUser, true]; // Return the newly created user object
}




//check here for plan type 

async function getPlanDetails(pricing_plan_id, country_iso) {
  if (country_iso && !pricing_plan_id) {
    return { plan: { country_iso:country_iso,period:"month",cost:country_iso==="IN"?799:199 ,name:"phone number subscribe" }, planType: "buy_number" };
  }
  let plan = await PricePlan.findById(pricing_plan_id);
  if (plan) return { plan, planType: "chatbot" };

  plan = await VoiceAIPricePlan.findById(pricing_plan_id);
  if (plan) return { plan, planType: "ai_voice" };

  return null;
}
module.exports = {
    getRestriction,
    establishRestriction,
    updatePricingPlan,
    getPricingPlan,
    updateUser,
    updateRestrictionWithPricing,
    createOrgUser,
    getCurrentPlan,
    getPricingPlanAiVoice,
    getPlanDetails,
    deletePricingPlan
};