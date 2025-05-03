const { createOrgUser } = require("../user/impl");
const { User } = require("../user/model");
const { editableUserModelFields } = require("./impl");
const { getOrganization } = require("./organization/impl");
const { Organization } = require("./organization/model");
const { getChatbotAccessByRoleID } = require("./permissions");
const catchAsyncError = require("../middleware/catchAsyncError.js")
const jwt = require('jsonwebtoken'); // For generating unique token
const {sendMailFun} =require("../utils/infra.js");



exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find({
        $or: [
            { _id: req.user.org_id },
            { org_id: req.user.org_id }
        ]
    }).sort({ role_id: 1 });  // Sort by 'role_id' in ascending order (1 for ascending, -1 for descending)

    return res.status(200).json({ users, success: true });
});


exports.editUser = catchAsyncError(async (req, res, next) => {
    const { role_id, user_id } = req.body;
    console.log("this is the update user",req.body);
    if (role_id && role_id <= req.user.role_id) {
        return res.status(400).json({ message: "You can't assign this user role, only users with higher roles can do it", success: false });
    }
    const user = await User.findOne({ _id: user_id, org_id: req.user.org_id });

    const model_keys = editableUserModelFields();
    model_keys.forEach((key) => {
        if (req.body[key] !== undefined) {
            user[key] = req.body[key];
        }
    });

    await user.save()

    return res.status(200).json({ message: "success", success: true });
});


exports.inviteOrgUser  = catchAsyncError(async (req, res, next) => {
    try {
        const [_object, success] = await createOrgUser (req.user.org_id, req.body);
        if (!success) {
            return res.status(301).json({ message: _object, success: false });
        }

        const token = jwt.sign(
            { userID: _object._id},
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d' }
        );


        const registrationLink =  `https://urbanchat.ai/inviteNewUser?token=${token}`;
        const ctx = {
            full_name: _object.full_name,
            registration_link: registrationLink,
        };

        await sendMailFun('org_invite_user', ctx, _object.email);

        return res.status(200).json({
            message: "User  invited successfully, email sent",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
});



exports.getRole = catchAsyncError(async (req, res, next) => {
    const access_list = getChatbotAccessByRoleID(req.user.role_id);
    return res.status(200).json({access_list:access_list, success: true });
});











// Organization related controllers

/**
 * Retrieves the organization details for the authenticated user.
 * @param {Object} req - The request object, which contains user data (org_id).
 * @param {Object} res - The response object to send the organization data.
 * @param {Function} next - The next middleware in the stack.
 */
exports.getOrganization = catchAsyncError(async (req, res, next) => {
    // Await the result of getOrganization since it returns a promise
    const org = await getOrganization(req.user.org_id);

    // Return the organization data in the response
    return res.status(200).json({ organization: org, success: true });
});

/**
 * Modifies the organization details based on the request body.
 * @param {Object} req - The request object, which contains the body with fields to update.
 * @param {Object} res - The response object to send the success message.
 * @param {Function} next - The next middleware in the stack.
 */
exports.modifyOrg = catchAsyncError(async (req, res, next) => {
    // Await the result of getOrganization to get the organization document
    let org = await getOrganization(req.user.org_id);

    // Loop over the keys in the request body to update the organization
    Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
            org[key] = req.body[key]; // Update organization field if the value is defined
        }
    });

    // Save the updated organization
    await org.save();

    // Return the success message
    return res.status(200).json({ message: "Organization updated successfully", success: true });
});