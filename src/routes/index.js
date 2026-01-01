import express from "express";
import roomRoutes from "./roomRoutes.js";
import controllerRoutes from "./controllerRoutes.js";
import applianceRoutes from "./applianceRoutes.js";
import irCodeRoutes from "./irCodeRoutes.js";
import commandRoutes from "./commandRoutes.js";
import telemetryRoutes from "./telemetryRoutes.js";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public auth routes
router.use("/auth", authRoutes);

// Protected routes
router.use(authMiddleware);
router.use("/rooms", roomRoutes);
router.use("/controllers", controllerRoutes);
router.use("/appliances", applianceRoutes);
router.use("/ir-codes", irCodeRoutes);
router.use("/commands", commandRoutes);
router.use("/telemetry", telemetryRoutes);
router.use("/users", userRoutes);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
