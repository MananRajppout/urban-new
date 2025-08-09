const { VoiceAiInvoice } = require("../voice_ai/model");
const sipClient = require("./configs/liveClient");
const plivoClient = require("./configs/plivoClient");
const { PlivoPhoneRecord } = require("./model/plivoModel");
const mongoose=require("mongoose")
const dotenv = require('dotenv');
const uuid = require("uuid")
dotenv.config();
const {
  AiAgent,
} = require("../voice_ai/model");

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
    const smallestResponse = await fetch(
      "https://waves-api.smallest.ai/api/v1/lightning/get_voices",
      options
    );
    const smallestData = await smallestResponse.json();
    const smallest = smallestData.voices.map((v) => ({
      name: v.displayName,
      voice_id: v.voiceId,
      gender:v.tags.gender,
      voice_url:"",
      age:v.tags.age,
      accent:v.tags.accent
    }));
    const smallestV2Response = await fetch(
      "https://waves-api.smallest.ai/api/v1/lightning-v2/get_voices",
      options
    );
    const smallestV2Data = await smallestV2Response.json();
    const smallestV2 = smallestV2Data.voices.map((v) => ({
      name: v.displayName,
      voice_id: v.voiceId,
      gender:v.tags.gender,
      voice_url:"",
      age:v.tags.age,
      accent:v.tags.accent
    }));
    const smallestLargeResponse = await fetch(
      "https://waves-api.smallest.ai/api/v1/lightning-large/get_voices",
      options
    );
    const smallestLargeData = await smallestLargeResponse.json();
    const smallestLarge = smallestLargeData.voices.map((v) => ({
      name: v.displayName,
      voice_id: v.voiceId,
      gender:v.tags.gender,
      voice_url:"",
      age:v.tags.age,
      accent:v.tags.accent
    }));
    return {smallest,smallestV2,smallestLarge};
  } catch (err) {
    console.error(err);
  }
  return [];
};

exports.getSarvamVoices = async () => {
  const voices = [
    {
      name: "Anushka",
      accent: "Indian",
      gender: "Female",
      voice_id: "anushka",
      voice_url: "",
      age: null,
    },
    {
      name: "Abhilash",
      accent: "Indian",
      gender: "Female",
      voice_id: "abhilash",
      voice_url: "",
      age: null,
    },
    {
      name: "Manisha",
      accent: "Indian",
      gender: "Female",
      voice_id: "manisha",
      voice_url: "",
      age: null,
    },
    {
      name: "Vidya",
      accent: "Indian",
      gender: "Female",
      voice_id: "vidya",
      voice_url: "",
      age: null,
    },
    {
      name: "Arya",
      accent: "Indian",
      gender: "Female",
      voice_id: "arya",
      voice_url: "",
      age: null,
    },
    {
      name: "Karun",
      accent: "Western",
      gender: "Female",
      voice_id: "karun",
      voice_url: "",
      age: null,
    },

    {
      name: "Hitesh",
      accent: "Indian",
      gender: "Male",
      voice_id: "hitesh",
      voice_url: "",
      age: null,
    }
  ];
  return voices;
};

exports.getRimeVoice = async () => {
  const voices = [
    {
      'name': 'abbie',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'abbie',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'allison',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'allison',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'ally',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'ally',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'alona',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'alona',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'amber',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'amber',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'ana',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'ana',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'antoine',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'antoine',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'armon',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'armon',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'brenda',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'brenda',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'brittany',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'brittany',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'carol',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'carol',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'colin',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'colin',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'courtney',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'courtney',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'elena',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'elena',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'elliot',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'elliot',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'eva',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'eva',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'geoff',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'geoff',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'gerald',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'gerald',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'gypsum',
      'accent': 'ENG',
      'gender': 'Unknown',
      'voice_id': 'gypsum',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'hank',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'hank',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'helen',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'helen',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'hera',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'hera',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'jen',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'jen',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'joe',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'joe',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'joy',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'joy',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'juan',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'juan',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'kendra',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'kendra',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'kendrick',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'kendrick',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'kenneth',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'kenneth',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'kevin',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'kevin',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'kris',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'kris',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'linda',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'linda',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'madison',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'madison',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'marge',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'marge',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'marina',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'marina',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'marissa',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'marissa',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'marta',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'marta',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'maya',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'maya',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'nicholas',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'nicholas',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'nyles',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'nyles',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'phil',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'phil',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'reba',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'reba',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'rex',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'rex',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'rick',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'rick',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'ritu',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'ritu',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'rob',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'rob',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'rodney',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'rodney',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'rohan',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'rohan',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'rosco',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'rosco',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'samantha',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'samantha',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'sandy',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'sandy',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'selena',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'selena',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'seth',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'seth',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'sharon',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'sharon',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'stan',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'stan',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'tamra',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'tamra',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'tanya',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'tanya',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'tibur',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'tibur',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'tj',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'tj',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'tyler',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'tyler',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'viv',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'viv',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'yadira',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'yadira',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'zest',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'zest',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'isa',
      'accent': 'SPA',
      'gender': 'Female',
      'voice_id': 'isa',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'mari',
      'accent': 'SPA',
      'gender': 'Female',
      'voice_id': 'mari',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'pablo',
      'accent': 'SPA',
      'gender': 'Male',
      'voice_id': 'pablo',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'alois',
      'accent': 'FRA',
      'gender': 'Male',
      'voice_id': 'alois',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'juliette',
      'accent': 'FRA',
      'gender': 'Female',
      'voice_id': 'juliette',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'marguerite',
      'accent': 'FRA',
      'gender': 'Female',
      'voice_id': 'marguerite',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'amalia',
      'accent': 'GER',
      'gender': 'Female',
      'voice_id': 'amalia',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'frieda',
      'accent': 'GER',
      'gender': 'Female',
      'voice_id': 'frieda',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'karolina',
      'accent': 'GER',
      'gender': 'Female',
      'voice_id': 'karolina',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'klaus',
      'accent': 'GER',
      'gender': 'Male',
      'voice_id': 'klaus',
      'voice_url': '',
      'age': null
    }
  ]
  return voices;
};


exports.getKokoroVoices = async () => {
  const voices = [
    {
      'name': 'Heart',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_heart',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Bella',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_bella',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Nicole',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_nicole',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Aoede',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_aoede',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Kore',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_kore',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Sarah',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_sarah',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Nova',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_nova',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Sky',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_sky',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Alloy',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_alloy',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Jessica',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_jessica',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'River',
      'accent': 'ENG',
      'gender': 'Female',
      'voice_id': 'af_river',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Michael',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'am_michael',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Fenrir',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'am_fenrir',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Puck',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'am_puck',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Echo',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'am_echo',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Eric',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'am_eric',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Liam',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'am_liam',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Onyx',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'am_onyx',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Santa',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'am_santa',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Adam',
      'accent': 'ENG',
      'gender': 'Male',
      'voice_id': 'am_adam',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Emma',
      'accent': 'UK',
      'gender': 'Female',
      'voice_id': 'bf_emma',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Isabella',
      'accent': 'UK',
      'gender': 'Female',
      'voice_id': 'bf_isabella',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Alice',
      'accent': 'UK',
      'gender': 'Female',
      'voice_id': 'bf_alice',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Lily',
      'accent': 'UK',
      'gender': 'Female',
      'voice_id': 'bf_lily',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'George',
      'accent': 'UK',
      'gender': 'Male',
      'voice_id': 'bm_george',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Fable',
      'accent': 'UK',
      'gender': 'Male',
      'voice_id': 'bm_fable',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Lewis',
      'accent': 'UK',
      'gender': 'Male',
      'voice_id': 'bm_lewis',
      'voice_url': '',
      'age': null
    },
    {
      'name': 'Daniel',
      'accent': 'UK',
      'gender': 'Male',
      'voice_id': 'bm_daniel',
      'voice_url': '',
      'age': null
    }
  ];
  return voices;
}

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

   const agent = await AiAgent.findOne({
    user_id: user_id,
  });

  console.log("creating sip trunk...");
  const sipTrunkId = await this.createSIPTrunks(searchedNumber.number);
  console.log("sip trunk created", sipTrunkId);
  console.log("creating dispatch rule...");
  const dispatchRuleId = await this.createSIPDispatchRule(sipTrunkId, searchedNumber.number, agent?._id || undefined);
  console.log("dispatch rule created", dispatchRuleId);
  console.log("creating sip outbound trunk...");
  const sipOutboundTrunkId = await this.createOutboundTrunk(searchedNumber.number);
  console.log("sip outbound trunk created", sipOutboundTrunkId);



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
    plan_id:plan_id,
    sip_outbound_trunk_id: sipOutboundTrunkId,
    sip_trunk_dispatch_rule_id: dispatchRuleId,
    sip_trunk_id: sipTrunkId,
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


exports.createSIPTrunks = async (number) => {
  try {
    const numbers = [`+${number}`];
    const name = `Inbound Trunk for ${number}`;

    // Trunk options
    const trunkOptions = {
      krispEnabled: true,
    };

    const trunk = await sipClient.createSipInboundTrunk(
      name,
      numbers,
      trunkOptions,
    );

    console.log(trunk, 'trunk created');
    return trunk.sipTrunkId;

  } catch (err) {
    console.log(err, 'error in creating sip trunks');
    return null;
  }
}

exports.createSIPDispatchRule = async (trunkId,phoneNumber,agentId,dispatchRuleId=null) => {
  if(dispatchRuleId){
    await sipClient.deleteSipDispatchRule(dispatchRuleId);
  }

  try {
    const metadata = {
      agentId: agentId,
      callType: "telephone",
      callId: "test-call-id",
      dir: "inbound",
      customer_name: "test-customer-name",
      context: "test-context",
      phone_number: `+${phoneNumber}`,
      isWebCall: false
    }

    const rule = {
      roomPrefix: "call-",
      type: 'individual'
    };

    const options = {
      name: `Call Rule for ${phoneNumber}`,
      trunkIds: [trunkId],
      metadata: JSON.stringify(metadata)
    };

    if(!agentId){
      options.metadata = undefined;
    }
    
    const dispatchRule = await sipClient.createSipDispatchRule(rule, options);
    console.log("created dispatch rule", dispatchRule);
    return dispatchRule.sipDispatchRuleId
  } catch (err) {
    console.log(err, 'error in creating sip dispatch rule');
    return null;
  }
}


exports.createOutboundTrunk = async (phoneNumber) => {
  try {
    const address = process.env.PLIVO_OUTBOUND_SIP_TRUNK;
    const numbers = [`+${phoneNumber}`];

    // Trunk options
    const trunkOptions = {
      auth_username: process.env.PLIVO_OUTBOUND_AUTH_USERNAME,
      auth_password: process.env.PLIVO_OUTBOUND_AUTH_PASSWORD
    };

    const trunk = await sipClient.createSipOutboundTrunk(
      `Outbound Trunk for ${phoneNumber}`,
      address,
      numbers,
      trunkOptions
    );
    console.log("created outbound trunk", trunk);
    return trunk.sipTrunkId;
  } catch (error) {
    console.log(error, 'error in creating outbound trunk');
    return null;
  }
}


exports.createSIPParticipant = async (toNumber,fromNumber, trunkId,agentId,customer_name=undefined, context=undefined,callId=undefined,isGoogleSheet=false ) => {
  try {
    const caller_id = callId || uuid.v4();
    const metadata = {
      agentId: agentId,
      callType: "telephone",
      callId: caller_id,
      dir: "outbound",
      customer_name: customer_name,
      context: context,
      phone_number: `+${fromNumber}`,
      isWebCall: false,
      to_phone_number: toNumber,
      isGoogleSheet: isGoogleSheet
    }

    // Name of the room to attach the call to
    const roomName = `call-${toNumber}-${Date.now()}`;

    const sipParticipantOptions = {
      participantIdentity: `identity-${Date.now()}`,
      participantName: JSON.stringify(metadata),
      krispEnabled: true
    };

   
    const participant = await sipClient.createSipParticipant(
      trunkId,
      toNumber,
      roomName,
      sipParticipantOptions
    );
    console.log("created sip participant", participant);
    return caller_id;
  } catch (error) {
    console.log(error, 'error in creating sip participant');
    return null;
  }
}
