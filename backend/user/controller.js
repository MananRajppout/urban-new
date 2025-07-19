const catchAsyncError = require("../middleware/catchAsyncError");
const {
  User,
  VerificationToken,
  VerificationOtp,
  EmailNotification,
  WebsiteNotification
} = require("../user/model");
const {
  AiAgent,
  VoiceAiInvoice,
  CallHistory,
  SheetConfig,
} = require("../voice_ai/model");
const bcrypt = require("bcryptjs");
const ErrorHander = require("../utils/errorhandler");
const jwt = require("jsonwebtoken");
const { sendMailFun, generateOTP } = require("../utils/infra");
const crypto = require("crypto");
const {
  deleteAllChatbot,
  getChatModelViewCount,
  getChatbotContextByChatModel,
} = require("../chatbot/impl");
const { getRestriction, updatePricingPlan } = require("../user/impl");
const { Integrate } = require("../integrates/model");
const { getPricingPlan } = require("./impl");
const { ChatModel } = require("../chatbot/model");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { config } = require("dotenv");
const { PlivoPhoneRecord } = require("../v2/model/plivoModel");
config();

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const tenant = req.tenant;

  if (email && password) {
    const user = await User.findOne({ email, tenant }).select("+password");
   
    if (user) {
      if (!user.password) {
        return res.status(400).json({
          message: "Password not exists, Please reset your password",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (user.email == email && isMatch && user.is_active) {
        const token = jwt.sign(
          { userID: user._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "5d" }
        );
        res.status(200).json({
          success: true,
          message: "Login Successful",
          token: token,
          profile_image: user.profile_image,
          role: user.role,
          // user: user,
        });
      } else {
        res.status(400).json({ message: "Email or password is not valid" });
      }
    } else {
      res.status(400).json({ message: "Email or password is not valid" });
    }
  } else {
    res.status(400).json({ message: "All fields are required" });
  }
});

exports.createUser = catchAsyncError(async (req, res, next) => {
  const { email, password, slug, full_name } = req.body;
  const tenant = req.tenant;

  if (slug){
    let user = await User.findOne({
      $or: [{ slug_name: slug }],
    });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: `${slug} is already taken.` });
    }
  }

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  let user = await User.findOne({
    $or: [{ email: email,tenant }],
  });

  if (user) {
    return res
      .status(400)
      .json({ message: "User already exists with the same email" });
  }
  let trimmedpassword = password;
  trimmedpassword = trimmedpassword.trim();
  if (trimmedpassword.length < 6) {
    return res
      .status(402)
      .json({ message: "Password should be atleast longer than 8 characters" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(trimmedpassword, salt);
  req.body.password = hashPassword;

  const data = {
    email,
    password: hashPassword,
    full_name,
    tenant
  }
  if(slug){
    data["slug_name"] = slug;
    data["tenant"] = slug;
    data["role"] = "admin";
  }
  
  user = await User.create(data);

  sendVerificationEmail(email);

  await updatePricingPlan(user._id, await getPricingPlan(user._id));
  res.status(200).send({ success: true, message: "Please verify your email" });
});




exports.checkSlugAvaible = catchAsyncError(async (req, res, next) => {
  const { slug } = req.body;


  let user = await User.findOne({
    $or: [{ slug_name: slug }],
  });

  if (user) {
    return res
      .status(400)
      .json({ success: false, message: `${slug} is already taken.` });
  }

  res.status(200).send({ success: true, message: `${slug} is avaible.` });
});

exports.editUser = catchAsyncError(async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const payload = req.body;

    if (!user_id) {
      return res.status(401).json({ message: "Please provide user_id" });
    }

    if (payload.email) {
      const existingUser = await User.findOne({ email: payload.email });
      if (existingUser && existingUser._id.toString() !== user_id) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(payload.password, salt);
      payload.password = hashPassword;
    }
    const updatedUser = await User.findByIdAndUpdate(user_id, payload, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).send({
      success: true,
      message: "User details updated",
      user: updatedUser,
    });
  } catch (error) {
    console.log("editUser SYSTEM ERROR : ", error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  try {
    var chatbot_count = await getChatModelViewCount(req.user.id);
    var integrated_details = {
      is_whatsapp_integrated: false,
      is_facebook_integrated: false,
      is_shopify_integrated: false,
      is_wordpress_integrated: false,
    };

    if (await Integrate.exists({ user_id: req.user.id, type: "whatsapp" })) {
      integrated_details["is_whatsapp_integrated"] = true;
    }

    if (await Integrate.exists({ user_id: req.user.id, type: "facebook" })) {
      integrated_details["is_facebook_integrated"] = true;
    }

    const current_plan = await getPricingPlan(req.user.id);
    return res.status(200).send({
      success: true,
      user: req.user,
      chatbot_count: chatbot_count,
      integrated_details: integrated_details,
      // current_plan: current_plan,
    });
  } catch (error) {
    console.log("getUserDetails SYSTEM ERROR : ", error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

exports.requestNumber = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const tenant = req.tenant;
  const tenant_user = await User.findOne({slug_name: tenant});
  
  const ctx = {
    tenant_user_full_name: tenant_user.full_name,
    user_full_name: user.full_name,
    user_email: user.email,
  }

  const action = "request_number";

  const result = await sendMailFun(action,ctx, tenant_user.email);

  return res.status(200).json({
    success: true,
    message: "Request for a phone number sent",
  });
});

exports.verifyUserHash = catchAsyncError(async (req, res, next) => {
  const { token } = req.query;
  const verificationToken = await VerificationToken.findOne({ token });

  if (!verificationToken) {
    return res.status(404).json({ message: "Invalid verification token" });
  }
  const user = await User.findById(verificationToken.user_id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.is_active = true;
  await user.save();

  const TanentProvider = await User.findOne({slug_name: user.tenant});
  const url = TanentProvider.custom_domain ? `https://${TanentProvider.custom_domain}/signin` : `https://${TanentProvider.slug_name}.${process.env.MAIN_DOMAIN}/signin`
  await VerificationToken.deleteOne({ token });
  ctx = { login_link: url };
  sendMailFun("signup_confirmation", ctx, user.email);
  console.log(`${url}?verified=true`)
  res.redirect(`${url}?verified=true`);
});

const sendVerificationEmail = async (user_email) => {
  try {
    const user = await User.findOne({ email: user_email });
    const token = crypto.randomBytes(20).toString("hex");
    const verificationToken = new VerificationToken({
      user_id: user._id,
      token: token,
    });

    await verificationToken.save();

    // Send a verification email to the user
    const verification_link = `https://backend.urbanchat.ai/api/verify-user?token=${token}`;
    console.log(verification_link)
    ctx = { verification_link: verification_link }; //user_email
    const result = await sendMailFun("account_verification", ctx, user_email);

    console.log("Verification email sent successfully.", result);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

exports.getUserCount = catchAsyncError(async (req, res, next) => {
  try {
    const { token } = req.query;
    if (token != "323j4n2j3kanskd!!!!") {
      return res
        .status(400)
        .json({ message: "Not Authorized to perform this action" });
    }
    const users = await User.find().select("email");
    const user_count = users.length; //users.count()
    return res.status(200).json({
      message:
        "Note: Please donot use this api frequently, It can effect your application performance",
      user_count: user_count,
      users,
    });
  } catch (error) {
    console.log("getUserCount SYSTEM ERROR : ", error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

exports.deleteAccount = catchAsyncError(async (req, res, next) => {
  const user_id = req.query.user_id || req.user.id;
  const user = await User.findById(user_id).select("email");
  await deleteAllChatbot(user_id);
  await User.findByIdAndDelete(user_id);
  ctx = {};
  const email_success = await sendMailFun("delete_account", ctx, user.email);
  return res.status(200).json({
    success: true,
    message: "Your account has been successfully deleted",
  });
});

exports.fetchRestriction = catchAsyncError(async (req, res, next) => {
  const restriction = await getRestriction(req.user.id);

  const currentDate = new Date();
  const renewal_time = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  );
  restriction["renewal_time"] = renewal_time;

  return res
    .status(200)
    .json({ message: "success", restriction, renewal_time: renewal_time });
});

// api/forget-profile
exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const { action, email, otp } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "User not found with this email" });
  }
  if (action == "send_otp") {
    // Send otp to the end user whenever this action comes
    const exisiting_otp = await VerificationOtp.findOne({ user_email: email });
    if (exisiting_otp) {
      return res
        .status(200)
        .json({ success: true, message: "OTP is already been sent" });
    }
    const otp = generateOTP();
    await VerificationOtp.create({ user_email: email, otp: otp });

    //call a send email function here
    ctx = { otp: otp }; //user_email
    const result = await sendMailFun("forgot_account", ctx, email);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. An email has been sent to the client.",
    });
  } else if (action == "accept_otp") {
    // Check the otp and email is correct or not
    const exisiting_otp = await VerificationOtp.findOne({
      user_email: email,
      otp: otp,
    });

    console.log(exisiting_otp, 'check for existing otp here>>')

    if (!exisiting_otp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP is incorrect" });
    }

    user.is_active = true;
    await user.save();

    await VerificationOtp.deleteOne({ _id: exisiting_otp._id });
    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });
    return res.status(200).json({
      success: true,
      message: "Token has been sent",
      token: token,
    });
  }

  return res
    .status(400)
    .json({ success: false, message: "Action is not permitted" });
});

// api/reset-password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { new_password } = req.body;

  let trimmedpassword = new_password;
  trimmedpassword = trimmedpassword.trim();
  if (trimmedpassword.length < 6) {
    return res.status(402).json({
      success: false,
      message: "Password should be atleast longer than 8 characters",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(trimmedpassword, salt);
  req.user.password = hashPassword;
  req.user.is_active = true;
  await req.user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
});

exports.emailSubscribe = catchAsyncError(async (req, res, next) => {
  const email = req.query.email;
  if (!email) {
    return res
      .status(401)
      .json({ success: true, message: "Please provide a email" });
  }

  const _findEmailNotification = await EmailNotification.findOne({
    email: email,
  });
  if (_findEmailNotification) {
    return res.status(201).json({
      success: true,
      message: "This email is already subscribed to updates",
    });
  }
  await EmailNotification.create({ email: email });
  return res
    .status(200)
    .json({ success: true, message: "Email subscribed successfully" });
});

exports.chatbotContext = catchAsyncError(async (req, res, next) => {
  const { user_msg, chatbot_id } = req.query;
  const chatbot = await ChatModel.findOne({ id: chatbot_id });
  const context = await getChatbotContextByChatModel(chatbot, user_msg);

  return res
    .status(200)
    .json({ success: true, message: "Email subscribed successfully", context });
});

// fetch Notification for website : polling interval : 4s - 10s
exports.fetchWebsiteNotification = catchAsyncError(async (req, res, next) => {
  const notifications = await WebsiteNotification.find({
    user_id: req.user.id,
  });
  return res.status(200).json({
    success: true,
    message: "Website notifications fetched",
    notifications,
  });
});

// Post request triggered once notification is seen by the user
exports.seenWebsiteNotification = catchAsyncError(async (req, res, next) => {
  const { notification_ids } = req.body;
  await WebsiteNotification.deleteMany({
    user_id: req.user.id,
    _id: { $in: notification_ids },
  });
  return res
    .status(200)
    .json({ success: true, message: "Website notifications deleted" });
});


// api/settings
exports.getSettings = catchAsyncError(async (req, res, next) => {
  const settings = await User.findById(req.user.id);
  return res.status(200).json({
    success: true,
    message: "Settings fetched",
    settings,
  });
});

exports.updateSettings = catchAsyncError(async (req, res, next) => {
  const { daily_summary, call_summary, summary_email } = req.body;
  const settings = await User.findByIdAndUpdate(req.user.id, { daily_summary, call_summary, summary_email }, { new: true });
  return res.status(200).json({
    success: true,
    message: "Settings updated",
    settings,
  });
});


// get website name and logo
exports.getWebsiteNameAndLogo = catchAsyncError(async (req, res, next) => {
  const tenant = req.tenant;
  const settings = await User.findOne({slug_name: tenant});
  const agents = await AiAgent.find({user_id: settings._id});
  const phoneNumbers = await PlivoPhoneRecord.find({ user_id: settings._id });
 
  return res.status(200).json({
    success: true,
    message: "Website name and logo fetched",
    settings,
    agents,
    phoneNumbers
  });
});

// update website name and logo
exports.updateWebsiteNameAndLogo = catchAsyncError(async (req, res, next) => {
  const { website_name, logo, contact_email, meta_description, live_demo_agent, live_demo_phone_number } = req.body;
  // logo is base64 string upload it on cloudinary
  const data = {};
  if(logo){
    const logoUrl = await uploadToCloudinary(logo);
    data.logo = logoUrl;
  }

  if(website_name){
    data.website_name = website_name;
  }

  if(contact_email){
    data.contact_email = contact_email;
  }
  if(meta_description){
    data.meta_description = meta_description;
  }
  if(live_demo_agent){
    data.live_demo_agent = live_demo_agent;
  }

  if(live_demo_phone_number){
    data.live_demo_phone_number = live_demo_phone_number;
  }

  const tenant = req.tenant;
  const settings = await User.findOneAndUpdate({slug_name: tenant}, { ...data }, { new: true });
  return res.status(200).json({
    success: true,
    message: "Website name and logo updated",
    settings,
  });
});