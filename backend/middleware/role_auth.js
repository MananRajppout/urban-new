const { getChatbotAccessByRoleID } = require("../user_management/permissions");

/**
 * Middleware to check if the user has the required access for a role.
 * @param {Object} kwargs - The permissions and options passed to the middleware.
 * @returns {Function} Express middleware function.
 */
function rolePermit({ permit_access }) {
    return async (req, res, next) => {
        // Ensure that 'permit_access' is provided and check if it's in the allowed permissions for the user's role.
        if (permit_access && !getChatbotAccessByRoleID(req.user.role_id).includes(permit_access)) {
            return res.status(403).json({ message: "Access denied. The user does not have the required permission" });
        }
        
        // If user has access, proceed to the next middleware/route handler
        next();
    };
}

module.exports = rolePermit;