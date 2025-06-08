import env from "./config/env.js";
import express from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import cors from "cors";
import { CallHandler } from "./CallHandler.js";
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import { CalController, CalBookingController } from "./utils/CalController.js";
const app = express();
app.use(cors());

// OR Explicitly allow all origins
// app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  console.log("land call")
  const parsedUrl = new URL(
    request.url || "",
    `http://${request.headers.host}`
  );

  if (parsedUrl.pathname?.startsWith("/media-stream")) {
    // print query
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", async (plivoWs, request) => {
  try {
    console.log("call recieved");
    const start_time = performance.now();
    await CallHandler.Init(plivoWs, request);
    const end_time = performance.now();
    console.log(
      "Time taken to initialize call handler in ms",
      end_time - start_time
    );
  } catch (err: any) {
    console.error("Error in CallHandler.Init", err);
    plivoWs.send(JSON.stringify({ error: err.message }));
    plivoWs.close();
  }
});

app.get("/", (req, res) => {
  console.log("server is running");
  res.send("urbanchat voice server");
});

// error handler
app.use(errorHandler);
app.post("/save-cal-availability-settings", CalController);
app.post("/save-cal-booking-settings", CalBookingController);

async function main() {
  await connectDB();
  server.listen(env.PORT, () => {
    console.log("server is running on port", env.PORT);
  });
}

main();

