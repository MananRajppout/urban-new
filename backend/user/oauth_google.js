const passport = require('passport');
require('../passport');
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../middleware/catchAsyncError");
const { User } = require('./model');
const { sendMailFun } = require('../utils/infra');

exports.googleCallback = catchAsyncError(async (req, res, next) => { // google/callback'

    if (req.user) {
        const token = jwt.sign( { userID: req.user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });
        const user = await User.findById(req.user._id);
        // res.redirect(`https://urbanchat.ai?token=${token}`);// redirection after google login
        res.redirect(`https://urbanchat.ai/?token=${token}`);
       
    } else {
        res.status(401).json({ message: 'Authentication failed' });
    }
});


// Note : not used 
exports.googleSuccess = catchAsyncError(async (req, res, next) => { // googlesuccess
    console.log('You are logged in');
    res.send(`Welcome ${req.user.displayName}`)
});

// Note : not used 
exports.googleFailed = catchAsyncError(async (req, res, next) => { // googleFailed
    console.log('User is not authenticated');
    res.send("Failed")
});