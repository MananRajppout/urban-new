require('dotenv').config();
const passport =require("passport");
const { User } = require("./user/model");
const { sendMailFun } = require('./utils/infra');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

/* google ouath passport */
passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_ID,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
        // passReqToCallback   : true
    },
    async function(request, accessToken, refreshToken, profile, done) {
        try {
            // Check if the user already exists in your database by email
            console.log("🚀 Passport callback triggered", profile);
            const _find = await User.findOne({ email: profile.emails[0].value });
            // console.log("punch first ", profile.emails[0].value)

           
        
            if (!_find) {
                await User.create({ email: profile.emails[0].value ,full_name:profile.displayName,is_active:true });
                const ctx = {login_link:"https://urbanchat.ai/login"}
                await sendMailFun('signup_confirmation', ctx, profile.emails[0].value)
            }
            const user = await User.findOne({ email: profile.emails[0].value });
            return done(null, user);
        } catch (error) {
            console.log("Error in passport Function : ",error)
            return done(error, false);
        }
    }
));

/* End google ouath passport */


/* Facebook ouath passport */
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET_ID,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'email'], 
  }, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if the user already exists in your database by email
        let user = User.findOne({ email: profile.emails[0].value });
    
        if (!user) {
            user = User.create({ email: profile.emails[0].value });
        }
        return done(null, user);
    } catch (error) {
        console.log("Error in passport Function : ",error)
        return done(error, false);
    }
  }
));


passport.serializeUser(function(user, done) {
    console.log(user ,'here check user>>')
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log(user,'here check user')
    done(null, user);
});