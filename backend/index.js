const app = require("./app.js");
const dotenv = require("dotenv");
const connectDatabase = require("./connectDatabase");
const schedulerService = require("./services/schedulerService");
dotenv.config()
app.get("/", (req, res) => {
  res.send("API is running");
});


const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server is port on the ${PORT}`);
});
schedulerService.start();
connectDatabase();

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled rejection`);
});
