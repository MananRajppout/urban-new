const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");
const { User } = require("../user/model");
const axios =require("axios")
const catchAsyncError = require("../middleware/catchAsyncError");

async function key(kid) {
    const client = jwksClient({
      jwksUri: "https://appleid.apple.com/auth/keys",
      timeout: 30000
    });
  
    return await client.getSigningKey(kid);
} 

exports.appleLogin = catchAsyncError(async (req, res, next) => {
    try{
        const { id_token } = req.body
        const { header } = jwt.decode(id_token, {
            complete: true
        })
    
        const kid = header.kid
        const publicKey = (await key(kid)).getPublicKey()
    
        const payload = jwt.verify(id_token, publicKey);

         // Check if the user already exists in your database by email
        let user = await User.findOne({ email: payload.email });
    
        if (!user) {
            user = await User.create({ email: payload.email });
        }

        // check payload.aud == 'YOUR_ID'

        const token = jwt.sign( { userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });
        res.status(200).json({ success: true, message: "Login Successful", token: token,});
    } catch(error){
        console.log("Error while doing the appleLogin : ",error)
        return res.status(500).json({ success: false, message: "something went wrong"});
    }
});

exports.handleIosGoogleLogin=catchAsyncError(async(req,res,next)=>{
    try {
        const { access_token } = req.body;
    
        const googleUser = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`
        );
    
        const { email, name } = googleUser.data;
    
        console.log(email,name,'check for email or name')
    
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            full_name: name,
          });
        }

        
    
    const token = jwt.sign( { userID:user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });
    res.status(200).json({ token,role:user.role });
      } catch (error) {
        console.log("Google login error", error);
        res.status(500).json({ message: "Login failed" });
      }


})