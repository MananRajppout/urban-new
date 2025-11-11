const app = require("./app.js");
const dotenv = require("dotenv");
const connectDatabase = require("./connectDatabase");
const schedulerService = require("./services/schedulerService");
const { startSubscription } = require("./services/redisService");
dotenv.config()
app.get("/", (req, res) => {
  res.send("API is running");
});


const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, async () => {
  console.log(`Server is port on the ${PORT}`);
  await schedulerService.start();
  console.log("Scheduler started");
  await startSubscription();
  console.log("Subscription started");
});

connectDatabase();

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled rejection`);
});

