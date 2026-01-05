import express from "express";
import {
  // createCommand,
  getCommands,
  // getCommandById,
  // updateCommandStatus,
  // getCommandsByStatus,
  // getPendingCommands,
  sendCommand,
} from "../controllers/commandController.js";

const router = express.Router();

// Unified endpoint: FE calls this to publish command and log to DB
router.post("/send", sendCommand);

// Legacy/secondary routes (temporarily disabled)
// router.post("/", createCommand); // Create new command
router.get("/", getCommands); // Get history commands
// router.get("/pending", getPendingCommands); // Get pending commands
// router.get("/status/:status", getCommandsByStatus); // Get commands by status
// router.get("/:id", getCommandById); // Get single command
// router.patch("/:id/status", updateCommandStatus); // Update command status
// router.post("/devices/:id/commands/:cmd/send", sendCommand); // Legacy send

export default router;
