import express from "express";
import {
  createCommand,
  getCommands,
  getCommandById,
  updateCommandStatus,
  getCommandsByStatus,
  getPendingCommands,
  sendCommand,
} from "../controllers/commandController.js";

const router = express.Router();

// Command routes
router.post("/", createCommand); // Create new command
router.get("/", getCommands); // Get commands for user
router.get("/pending", getPendingCommands); // Get pending commands
router.get("/status/:status", getCommandsByStatus); // Get commands by status
router.get("/:id", getCommandById); // Get single command
router.patch("/:id/status", updateCommandStatus); // Update command status

// Legacy route for backward compatibility
router.post("/devices/:id/commands/:cmd/send", sendCommand); // Send command to device

export default router;
