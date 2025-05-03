const { VoiceAiInvoice } = require("../voice_ai/model");
const plivoClient = require("./configs/plivoClient");
const { PlivoPhoneRecord } = require("./model/plivoModel");
const mongoose=require("mongoose")

exports.getNumberRateInCent = (countryISO) => {
  if (countryISO === "US") {
    return 199;
  }

  if (countryISO === "IN") {
    return 799;
  }
  throw new Error("This country is not supported");
};

exports.justPhoneNumber = (phoneNumberWithCode, iso) => {
  // this phone number has country calling code without + sign
  // e.g. 919876543210 for India
  // e.g 14155552671 for US
  // return just phone number without country code
  if (iso === "IN") {
    return phoneNumberWithCode.slice(2);
  }
  if (iso === "US") {
    return phoneNumberWithCode.slice(1);
  }
  throw new Error("This country is not supported");
};

// convert rate from cent dollar or rupees based on country
exports.numberRateInCurrency = (countryISO) => {
  if (countryISO === "US") {
    return 2; //dollars
  }

  if (countryISO === "IN") {
    return 499; //rupees
  }
  throw new Error("This country is not supported");
};

exports.getMinutesDiff = (date1, date2) => {
  if (!date1 || !date2) return 0;

  return Math.abs((new Date(date2) - new Date(date1)) / (1000 * 60));
};

exports.getSmallestVoices = async () => {
  const api_key = process.env.SMALLEST_AI_API_KEY;
  const options = {
    method: "GET",
    headers: { Authorization: "Bearer " + api_key },
  };

  try {
    const response = await fetch(
      "https://waves-api.smallest.ai/api/v1/lightning/get_voices",
      options
    );
    const data = await response.json();
    return data.voices.map((v) => ({
      name: v.displayName,
      voice_id: v.voiceId,
      gender:v.tags.gender,
      voice_url:"",
      age:v.tags.age,
      accent:v.tags.accent
    }));
  } catch (err) {
    console.error(err);
  }
  return [];
};

exports.getSarvamVoices = async () => {
  const voices = [
    {
      name: "Meera",
      accent: "Indian",
      gender: "Female",
      voice_id: "meera",
      voice_url: "",
      age: null,
    },
    {
      name: "Pavithra",
      accent: "Indian",
      gender: "Female",
      voice_id: "pavithra",
      voice_url: "",
      age: null,
    },
    {
      name: "Maitreyi",
      accent: "Indian",
      gender: "Female",
      voice_id: "maitreyi",
      voice_url: "",
      age: null,
    },
    {
      name: "Diya",
      accent: "Indian",
      gender: "Female",
      voice_id: "diya",
      voice_url: "",
      age: null,
    },
    {
      name: "Maya",
      accent: "Indian",
      gender: "Female",
      voice_id: "maya",
      voice_url: "",
      age: null,
    },
    {
      name: "Misha",
      accent: "Western",
      gender: "Female",
      voice_id: "misha",
      voice_url: "",
      age: null,
    },

    {
      name: "Arvind",
      accent: "Indian",
      gender: "Male",
      voice_id: "arvind",
      voice_url: "",
      age: null,
    },
    {
      name: "Amol",
      accent: "Indian",
      gender: "Male",
      voice_id: "amol",
      voice_url: "",
      age: null,
    },
    {
      name: "Amartya",
      accent: "Indian",
      gender: "Male",
      voice_id: "amartya",
      voice_url: "",
      age: null,
    },
    {
      name: "Neel",
      accent: "Indian",
      gender: "Male",
      voice_id: "neel",
      voice_url: "",
      age: null,
    },
    {
      name: "Arjun",
      accent: "Indian",
      gender: "Male",
      voice_id: "arjun",
      voice_url: "",
      age: null,
    },
    {
      name: "Vian",
      accent: "Western",
      gender: "Male",
      voice_id: "vian",
      voice_url: "",
      age: null,
    },
  ];
  return voices;
};

exports.buyNumberFunction = async (user_id, countryISO,plan_id,session_id,type='checkout') => {
  if (!countryISO) {
    return { success: false, message: "countryISO is required" };
  }



  if (typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)) {
    user_id = new mongoose.Types.ObjectId(userId);
  }

  // Search for a phone number in Plivo
  let searchedNumber = await plivoClient.numbers.search(countryISO);
  if (!searchedNumber.length) {
    return { success: false, message: "Phone number not found" };
  }
  searchedNumber = searchedNumber[0];

  // Get the number rate in cents
  let totalAmount = this.getNumberRateInCent(countryISO);



  // Save transaction details
  await VoiceAiInvoice.create({
    user_id: user_id,
    amount: totalAmount,
    currency: "INR",
    payment_intent_id: session_id,
    payment_method: "Phone Number Purchase",
  });

  // Buy Plivo number
  const appId = process.env.PLIVO_VOICE_APP_ID;

  let purchasedNumber = await plivoClient.numbers.buy(
    searchedNumber.number,
    appId
  );

 

  if (purchasedNumber.status !== "fulfilled") {
    return { success: false, message: "Phone number not purchased. Some error occurred" };
  }

   numberDetails = await plivoClient.numbers.get(searchedNumber.number);



  // Create a phone record
  const phoneRecord = new PlivoPhoneRecord({
    user_id,
    app_id: appId,
    phone_number: searchedNumber.number,
    country: countryISO,
    number_type: numberDetails.type || "local",
    number_location: numberDetails.region || "",
    status: numberDetails.active ? "active" : "inactive",
    monthly_rental_fee: totalAmount,
    currency: countryISO === "IN" ? "INR" : "INR",
    renewal_date: numberDetails.renewalDate || "",
    plan_id:plan_id
  });

  await phoneRecord.save();

  console.log(phoneRecord,'check for phone record')

  return { success: true, message: "Phone number added successfully", numberStatus: "fulfilled" };
};



exports.deletePhoneNumberPlan = async (user_id, plan_id) => {
  try {
    //  Convert user_id to ObjectId if it's a string
    if (typeof user_id === 'string' && mongoose.Types.ObjectId.isValid(user_id)) {
      user_id = new mongoose.Types.ObjectId(user_id);
    }

    // Find the phone record
    const phoneRecord = await PlivoPhoneRecord.findOne({
      user_id,
      plan_id
    });

    if (!phoneRecord) {
      console.log("Phone record not found!");
      return;
    }

    //  Get the phone number from DB
    const phoneNumber = phoneRecord.phone_number; // assuming your schema has a field 'phoneNumber'

    //  Update Plivo number (disable it)
  const result=  await plivoClient.numbers.update(phoneNumber, {
      alias: "Temporarily Disabled",
      app_id: null // unassign the application
    });
    console.log(result,'check for phone numbercheck')

    //  Update  DB status
    phoneRecord.status = "inactive";
    await phoneRecord.save();


  } catch (error) {
    console.error("Error in deletePhoneNumberPlan:", error);
  }
};


exports.makePlivoNumberActive = async (plan_id,user_id) => {
  try {

    if (typeof user_id === 'string' && mongoose.Types.ObjectId.isValid(user_id)) {
      user_id = new mongoose.Types.ObjectId(user_id);
    }
    const record = await PlivoPhoneRecord.findOne({
      user_id,
      plan_id
    });

    if (!record) {
      console.log('Record not found');
      return { success: false, message: 'Record not found' };
    }

    const { phone_number } = record;

    const appId = process.env.PLIVO_VOICE_APP_ID;

    const result = await plivoClient.numbers.update(phone_number, {
      alias: 'Active Number',  
      app_id: appId              // Plivo App ID zaruri hai
    });

    record.status = 'active';
    await record.save();

    return { success: true, message: 'Plivo number activated', result };
  } catch (error) {
    console.error(' Error activating Plivo number:', error.message);
    return { success: false, message: error.message };
  }
};




exports.deletePlivoNumberPaymentFailed = async (plan_id, user_id, stripeSubId) => {
  try {
    // Validate inputs
 
    if (!plan_id || !user_id || !stripeSubId) {
      return {
        success: false,
        message: "Required parameters missing: plan_id, user_id, or stripeSubId",
      };
    }

    // Ensure valid ObjectId
    if (typeof user_id === "string" && mongoose.Types.ObjectId.isValid(user_id)) {
      user_id = new mongoose.Types.ObjectId(user_id);
    }

    // Fetch the record
    const plivoRecord = await PlivoPhoneRecord.findOne({ plan_id, user_id });
    if (!plivoRecord) {
      return { success: false, message: "Plivo record not found" };
    }

    const phoneNumber = plivoRecord.phone_number;

    // Cancel Str
    // ipe subscription
    const stripeCancelResult = await stripe.subscriptions.cancel(stripeSubId);
    console.log(stripeCancelResult,'check for phone number')

    // Unrent Plivo number
    const plivoUnrentResult = await plivoClient.numbers.unrent(phoneNumber);

    // Remove the record from DB
    await PlivoPhoneRecord.deleteOne({ phone_number: phoneNumber });

    // Pull subscription from user
    await User.updateOne(
      { _id: user_id },
      { $pull: { subscriptions: { planId:planId } } }
    );

    // Return response
    return {
      success: true,
      message: "Plivo number and Stripe subscription removed successfully",
      data: {
        phoneNumber,
        stripeCancelResult,
        plivoUnrentResult,
      },
    };
  } catch (err) {
  console.log(err ,'no such a number founr like this ')
  }
};

