const { User } = require("../user/model");
const { getChatbotAccessByRoleID } = require("../user_management/permissions");
const ErrorHander = require("../utils/errorhandler");
const jwt = require('jsonwebtoken');

function checkSessionExpiration(allowedTypes,kwargs={}) {
    return async (req, res, next) => {
        const bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== "undefined") {
            const bearer = bearerHeader.split(" ");
            const token = bearer[1];
            try{
                jwt.verify(token, "DF983kjhfqn7@$@%*bjbfh12_", async (err, decodedData) => {
                    if (err){
                        return res.status(401).json({ message: "Token Expired" });
                    }
                    req.user = await User.findById(decodedData.userID);
                    if (!req.user || !allowedTypes.includes(req.user.user_type)) {
                        res.status(403).json({ message: "User is not allowed to access this resource" });
                    } else{
                        if (!req.user.org_id && req.user.role_id === 1) {
                            req.user.org_id = req.user.id;
                        }
                        next()
                    }
                });
            } catch(error) {
                res.status(500).json({ message: "Internal server error" });
            }
        } else {
            res.status(403).json({ message: "Please provide Authorization token" });
        }
    };
}

module.exports = checkSessionExpiration;