import express from "express";
import {
  createController,
  getControllers,
  getControllerById,
  updateController,
  deleteController,
  updateOnlineStatus,
  getControllersByRoom,
  getOnlineControllers,
} from "../controllers/controllerController.js";

const router = express.Router();

// Controller routes
router.post("/", createController); // Create new controller
router.get("/", getControllers); // Get all controllers for user
router.get("/online", getOnlineControllers); // Get online controllers
router.get("/room/:roomId", getControllersByRoom); // Get controllers by room
router.get("/:id", getControllerById); // Get single controller
router.put("/:id", updateController); // Update controller
router.patch("/:id", updateController); // Update controller (alternative)
router.delete("/:id", deleteController); // Delete controller
router.patch("/:id/status", updateOnlineStatus); // Update online status

export default router;
