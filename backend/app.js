const express = require("express");
var cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const errorMiddleware = require("./middleware/error");
var bodyParser = require("body-parser");
require("dotenv").config();
const passport = require("passport");
require("./passport");
const ExpressWs = require("express-ws");
ExpressWs(app);
app.use(cookieParser());

const fileUpload = require("express-fileupload");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { stripeWebhook } = require("./pricing/controller");
/*          packages                         */

const slackProxyOptions = {
  target: process.env.SLACK_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api/slackEvents": "/slack/events",
  },
};
const slackProxy = createProxyMiddleware(slackProxyOptions);
app.use("/api/slackEvents", slackProxy);

//add this line access the mp3 files in through local host
app.use("/voice_ai", express.static(path.join(__dirname, "voice_ai")));

// stripe webhook is placed before any body parsing middleware so that we can send raw body to function (required)
app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: true, // Allow cookies/auth headers
  })
);

app.options("*", cors());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp", //custom dir path so we have to only clean the one directory
  })
);

app.use(
  session({
    name: "session_urbanchat",
    secret: "MNyqHYaEX5RRs4yS@cluster0.zvheusy.mongodb.net/?",
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    resave: false,
    saveUninitialized: true,
    //store: MongoStore.create({
    //mongoUrl: 'mongodb+srv://prochimps:MNyqHYaEX5RRs4yS@cluster0.zvheusy.mongodb.net/?retryWrites=true&w=majority'
    //})
  })
);

app.use(passport.initialize()); // Google oauth related
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(errorMiddleware);

const sheetRoute = require("./v2/routes/sheetRoute");
const users = require("./routes/user");
const chatbot = require("./routes/chatbot");
const blogs = require("./routes/blogs");
const pricing = require("./routes/pricing");
const whatsapp = require("./routes/whatsapp");
const facebook = require("./routes/facebook");
const support = require("./routes/support");
const integrate = require("./routes/integrate");
const admin = require("./routes/admin");
const slack = require("./routes/slack");
const calendly = require("./routes/calendly");
const voice_ai = require("./routes/voice_ai");
const appsumo = require("./routes/appsumo");
const stats = require("./routes/stats");
const { handleTelnyxConnectionV2 } = require("./voice_ai/websockethandlerV2");
const crons = require("./routes/crons");
const user_management = require("./routes/user_management");
const plivoRoute = require("./v2/routes/plivoRoute");
const webcallRoute = require("./v2/routes/webcallRoute");
const voiceSettingRoute = require("./v2/routes/voiceSettingRoute");
app.use("/api", users);
app.use("/api", chatbot);
app.use("/api", blogs);
app.use("/api", pricing);
app.use("/api", whatsapp);
app.use("/api", facebook);
app.use("/api", support);
app.use("/api", integrate);
app.use("/api", admin);
app.use("/api", slack);
app.use("/api", calendly);
app.use("/api", voice_ai);
app.use("/api", appsumo);
app.use("/api", crons);
app.use("/api", stats);
app.use("/api", user_management);
app.use("/api", plivoRoute);
app.use("/api", webcallRoute);
app.use("/api", voiceSettingRoute);
app.use("/api", sheetRoute);
// WebSocket route with the imported handler
app.ws("/ws/telnyx-connection", handleTelnyxConnectionV2);

app.get("/api/health", (req, res) => {
  res.send("OK");
});

module.exports = app;
