import express from "express";
import {
  // createCommand,
  getCommands,
  getCommandById,
  updateCommand,
  // getCommandsByStatus,
  // getPendingCommands,
  sendCommand,
} from "../controllers/commandController.js";

const router = express.Router();

// Unified endpoint: FE calls this to publish command and log to DB
router.post("/send", sendCommand);

// Get commands for user
router.get("/", getCommands); // Get history commands

// Get single command by ID
router.get("/:id", getCommandById); // Get single command

// Update command (full update, not just status)
router.put("/:id", updateCommand); // Update command
router.patch("/:id", updateCommand); // Update command (alias)

// Legacy/secondary routes (temporarily disabled)
// router.post("/", createCommand); // Create new command
// router.get("/pending", getPendingCommands); // Get pending commands
// router.get("/status/:status", getCommandsByStatus); // Get commands by status
// router.post("/devices/:id/commands/:cmd/send", sendCommand); // Legacy send

export default router;
