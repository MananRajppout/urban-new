const {config} = require("dotenv");
const { User } = require("../user/model");
const { minimatch } = require("minimatch");


config()
const ignoreRoutes = ["/api/fetch-ai-agent/*","/api/webcall/webhook/pickup","/api/webcall/webhook/hangup","/api/verify-user?*","/api/stripe-success-callback?*","/api/stripe-failure-callback?*","/api/auth/google-ios-login","/api/create-payment-session","/api/create-razorpay-session"]

function isIgnoredRoute(uri) {
  return ignoreRoutes.some((pattern) => minimatch(uri, pattern));
}

async function extractTenantFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    let hostname = parsedUrl.hostname;
    hostname = hostname.replace("www.","");
    const parts = hostname.split('.');
    console.log(parts,"parts",hostname)
    

   const length = process.env.NODE_ENV == "development" ? 1 : 2;
    

    if (parts.length > length) {
        const subdomain = parts[0];
        const tanentOwner = await User.findOne({slug_name: subdomain});
    
        if(!tanentOwner){
            return null
        }

        return tanentOwner.slug_name;
    }

    const custom_domain = parsedUrl.hostname;
    if(custom_domain == process.env.MAIN_DOMAIN) return "main";



    const tanentOwner = await User.findOne({custom_domain: custom_domain});
 
    if(!tanentOwner){
        return null
    }

    return tanentOwner.slug_name
  } catch (error) {
    console.error("Invalid URL:", error.message);
    return null;
  }
}



const tenantMiddleware = async (req, res, next) => {
    const url = req.headers.origin;
    console.log(url,"heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    const tenant = await extractTenantFromUrl(url);
    const uri = req.url;
   console.log(uri,isIgnoredRoute(uri))
    if(!tenant && !isIgnoredRoute(uri)){
        return res.status(401).json({
            success: false,
            message: "Invalid Tenant"
        })
    }


    req.tenant = tenant;
    next();
};
module.exports = tenantMiddleware;
