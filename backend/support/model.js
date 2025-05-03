const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
    user_requested_id: { type:String, required:true },
    first_name: { type:String, required:true, default:""},
    last_name: { type:String, required:true, default:""},
    email: { type:String, required:true, default:""},
    phone_number: { type:String, required:true, default:""},
    about: { type:String, required:true, default:""},

    created_time: { type: Date, default: Date.now },
});

const caseReportSchema = new mongoose.Schema({
    email: { type:String, required:true },
    chatbot_id: { type:String, required:false },
    problem_area : { type:String, required:false },
    severity : { type:String, required:false, default:'low'},
    subject : {type:String, required:false },
    description: { type:String, required:false }
});

module.exports = {
    Invitation: mongoose.model('Invitation', invitationSchema),
    CaseReport: mongoose.model('CaseReport', caseReportSchema)
};