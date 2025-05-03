const passport = require('passport');

function facebookCallback(req, res, next) {
    passport.authenticate('facebook', (err, user, info) => {
        if (req.user) {
            const token = jwt.sign( { userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });
            res.status(200).json({ success: true, message: "Login Successful", token: token,});
        } else {
            res.status(401).json({ message: 'Authentication failed' });
        }
    })(req, res, next);
}


module.exports = {
    facebookCallback
};