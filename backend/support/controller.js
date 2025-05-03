const catchAsyncError = require("../middleware/catchAsyncError");
const { Invitation, CaseReport} = require("../support/model"); 
const { sendMailFun } = require('../utils/infra');


exports.createInvite = catchAsyncError(async (req, res, next) => {
    try{
        if (req.user.full_name == ""){
            return res.status(400).json({message: "To send an invitation, you should have a profile name. Please go to the profile section and edit the name.", success:false})
        }
        req.body.user_requested_id = req.user.id;
        await Invitation.create(req.body);
        // write the sending logic here
        ctx = { new_user_first_name : req.body.first_name, sender_full_name: req.user.full_name} //user_email
        const email_success = await sendMailFun('invite', ctx, email);
        return res.status(200).json({message: "Invitation sent", email_success})
    } catch(error){
        console.error("Error updating createInvite:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

exports.createCaseReport = catchAsyncError(async (req, res, next) => {
    try{
        await CaseReport.create(req.body);
        // write the sending logic here

        return res.status(200).json({message: "createCaseReport sent", success:true})
    } catch(error){
        console.error("Error updating createCaseReport:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


exports.fileServe = catchAsyncError(async (req, res, next) => {
    const filePath = process.env.DOCKER_EBS_PATH + "/" + req.query.file_name
    console.log(filePath)

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });

});