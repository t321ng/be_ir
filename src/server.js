import express from "express";
import connectDB from "./config/db.js";
import { createDevice, getDevices } from "./controllers/deviceController.js";
import { createCommand, sendCommand } from "./controllers/commandController.js";

const app = express();

connectDB();

app.use(express.json());

app.post("/api/devices", createDevice);
app.get("/api/devices", getDevices);
app.post("/api/commands", createCommand);

app.post("/devices/:id/commands/:cmd/send", sendCommand);

app.listen(5000, () => {
  console.log("Server run on port 5000...");
});
