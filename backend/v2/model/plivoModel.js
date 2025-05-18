const { type } = require("dynamoose");
const mongoose = require("mongoose");
const plivoPhoneRecordSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
    default: ""
  },
  app_id: {
    type: String,
    default: ""
  },
  sip_trunk_id: {
    type: String,
    default: ""
  },
  sip_outbound_trunk_id: {
    type: String,
    default: ""
  },
  sip_trunk_dispatch_rule_id: {
    type: String,
    default: ""
  },
  
  country: {
    type: String,
    required: true,
  },
  date_purchased: {
    type: Date,
    default: Date.now,
  },
  created_time: {
    type: Date,
    default: Date.now
  },
  updated_time: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "active"
  }
  ,
  number_type:{
    type: String,
    default: "local"
  },
  number_location:{
    type: String,
    default: ""
  },
  monthly_rental_fee:{
    type: String,
    
  },
  currency:{
type:String,
default:"USD"
  },
  total_seconds_used:{
    type:Number,
    default:0
  },
  renewal_date:{
    type:String,
   
  },
  plan_id:{
    type:String,
    required:true
  }
  
});

module.exports={
  PlivoPhoneRecord: mongoose.model("PlivoPhoneRecord", plivoPhoneRecordSchema)
}

