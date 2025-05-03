const mongoose = require("mongoose");

const bookedMeetingSchema = new mongoose.Schema({
  full_name: String,
  email: {type:String,required: true},
  start_time: {type:Date,required: true},
  event_type_uuid: {type:String,required: true},
  chatbot_id: { type: String, required:true} // Reference to the user who booked the meeting
});

// Step 2: Create a Mongoose model
module.exports = {
    BookedMeeting : mongoose.model('BookedMeeting', bookedMeetingSchema),
};