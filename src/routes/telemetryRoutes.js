import express from "express";
import {
  createTelemetry,
  createBulkTelemetry,
  getTelemetryByController,
  getTelemetryByTimeRange,
  getLatestTelemetry,
  getTelemetryStats,
  getAggregatedTelemetry,
  getAvailableMetrics,
  deleteOldTelemetry,
} from "../controllers/telemetryController.js";

const router = express.Router();

// Telemetry routes
router.post("/", createTelemetry); // Create new telemetry record
router.post("/bulk", createBulkTelemetry); // Batch create telemetry
router.get("/controller/:controllerId", getTelemetryByController); // Get telemetry by controller
router.get("/controller/:controllerId/latest", getLatestTelemetry); // Get latest telemetry
router.get("/controller/:controllerId/range", getTelemetryByTimeRange); // Get telemetry by time range
router.get("/controller/:controllerId/stats", getTelemetryStats); // Get telemetry statistics
router.get("/controller/:controllerId/aggregated", getAggregatedTelemetry); // Get aggregated telemetry
router.get("/controller/:controllerId/metrics", getAvailableMetrics); // Get available metrics
router.delete("/cleanup", deleteOldTelemetry); // Delete old telemetry (admin only)

export default router;
