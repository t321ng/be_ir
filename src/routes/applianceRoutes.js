import express from "express";
import {
  createAppliance,
  getAppliances,
  getApplianceById,
  updateAppliance,
  deleteAppliance,
  getAppliancesByRoom,
  getAppliancesByController,
  getAppliancesByType,
} from "../controllers/applianceController.js";

const router = express.Router();

// Appliance routes
router.post("/", createAppliance); // Create new appliance
router.get("/", getAppliances); // Get all appliances for user
router.get("/room/:roomId", getAppliancesByRoom); // Get appliances by room
router.get("/controller/:controllerId", getAppliancesByController); // Get appliances by controller
router.get("/type/:type", getAppliancesByType); // Get appliances by device type
router.get("/:id", getApplianceById); // Get single appliance
router.put("/:id", updateAppliance); // Update appliance
router.patch("/:id", updateAppliance); // Update appliance (alternative)
router.delete("/:id", deleteAppliance); // Delete appliance

export default router;
