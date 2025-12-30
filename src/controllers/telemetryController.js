import TelemetryService from "../services/telemetryService.js";
import { errorHandler } from "../utils/errorHandler.js";

// Create new telemetry record
export const createTelemetry = async (req, res) => {
  try {
    const { controller_id, metric, value, unit, topic, ts } = req.body;

    // Validate required fields
    if (!controller_id) {
      return errorHandler.missingField(res, "Controller ID");
    }

    if (!metric || metric.trim() === "") {
      return errorHandler.missingField(res, "Metric");
    }

    if (value === undefined || value === null) {
      return errorHandler.missingField(res, "Value");
    }

    if (typeof value !== "number") {
      return res.status(400).json({
        status: "error",
        message: "Value must be a number",
      });
    }

    const telemetryData = {
      controller_id,
      metric: metric.trim(),
      value,
      unit,
      topic,
      ts: ts ? new Date(ts) : new Date(),
    };

    const telemetry = await TelemetryService.createTelemetry(telemetryData);
    return res.status(201).json({
      status: "success",
      message: "Telemetry created successfully",
      data: telemetry,
    });
  } catch (error) {
    console.error("Error creating telemetry:", error);
    return errorHandler.handle(res, error);
  }
};

// Batch create telemetry
export const createBulkTelemetry = async (req, res) => {
  try {
    const { telemetryArray } = req.body;

    if (!Array.isArray(telemetryArray) || telemetryArray.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "telemetryArray must be a non-empty array",
      });
    }

    // Validate each item
    for (let i = 0; i < telemetryArray.length; i++) {
      const item = telemetryArray[i];
      if (!item.controller_id || !item.metric || item.value === undefined) {
        return res.status(400).json({
          status: "error",
          message: `Item ${i}: controller_id, metric, and value are required`,
        });
      }
    }

    const telemetry = await TelemetryService.createBulkTelemetry(
      telemetryArray
    );
    return res.status(201).json({
      status: "success",
      message: "Bulk telemetry created successfully",
      count: telemetry.length,
      data: telemetry,
    });
  } catch (error) {
    console.error("Error creating bulk telemetry:", error);
    return errorHandler.handle(res, error);
  }
};

// Get telemetry by controller
export const getTelemetryByController = async (req, res) => {
  try {
    const { controllerId } = req.params;
    const { limit = 100, metric } = req.query;

    if (!controllerId || controllerId.trim() === "") {
      return errorHandler.missingField(res, "Controller ID");
    }

    const telemetry = await TelemetryService.getTelemetryByController(
      controllerId,
      parseInt(limit),
      metric
    );

    if (!telemetry || telemetry.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No telemetry found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: telemetry.length,
      data: telemetry,
    });
  } catch (error) {
    console.error("Error getting telemetry by controller:", error);
    return errorHandler.handle(res, error);
  }
};

// Get telemetry by time range
export const getTelemetryByTimeRange = async (req, res) => {
  try {
    const { controllerId } = req.params;
    const { startTime, endTime, metric } = req.query;

    if (!controllerId || controllerId.trim() === "") {
      return errorHandler.missingField(res, "Controller ID");
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        status: "error",
        message: "startTime and endTime are required",
      });
    }

    const telemetry = await TelemetryService.getTelemetryByTimeRange(
      controllerId,
      new Date(startTime),
      new Date(endTime),
      metric
    );

    if (!telemetry || telemetry.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No telemetry found in the specified time range",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: telemetry.length,
      data: telemetry,
    });
  } catch (error) {
    console.error("Error getting telemetry by time range:", error);
    return errorHandler.handle(res, error);
  }
};

// Get latest telemetry
export const getLatestTelemetry = async (req, res) => {
  try {
    const { controllerId } = req.params;

    if (!controllerId || controllerId.trim() === "") {
      return errorHandler.missingField(res, "Controller ID");
    }

    const telemetry = await TelemetryService.getLatestTelemetry(controllerId);

    if (!telemetry || telemetry.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No latest telemetry found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: telemetry.length,
      data: telemetry,
    });
  } catch (error) {
    console.error("Error getting latest telemetry:", error);
    return errorHandler.handle(res, error);
  }
};

// Get telemetry statistics
export const getTelemetryStats = async (req, res) => {
  try {
    const { controllerId } = req.params;
    const { metric, startTime, endTime } = req.query;

    if (!controllerId || controllerId.trim() === "") {
      return errorHandler.missingField(res, "Controller ID");
    }

    if (!metric || metric.trim() === "") {
      return errorHandler.missingField(res, "Metric");
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        status: "error",
        message: "startTime and endTime are required",
      });
    }

    const stats = await TelemetryService.getTelemetryStats(
      controllerId,
      metric,
      new Date(startTime),
      new Date(endTime)
    );

    if (!stats) {
      return res.status(200).json({
        status: "success",
        message: "No statistics available for the specified criteria",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting telemetry stats:", error);
    return errorHandler.handle(res, error);
  }
};

// Get aggregated telemetry
export const getAggregatedTelemetry = async (req, res) => {
  try {
    const { controllerId } = req.params;
    const { metric, startTime, endTime, interval = "hour" } = req.query;

    if (!controllerId || controllerId.trim() === "") {
      return errorHandler.missingField(res, "Controller ID");
    }

    if (!metric || metric.trim() === "") {
      return errorHandler.missingField(res, "Metric");
    }

    if (!startTime || !endTime) {
      return res.status(400).json({
        status: "error",
        message: "startTime and endTime are required",
      });
    }

    const validIntervals = ["minute", "hour", "day"];
    if (!validIntervals.includes(interval)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid interval. Must be one of: ${validIntervals.join(", ")}`,
      });
    }

    const telemetry = await TelemetryService.getAggregatedTelemetry(
      controllerId,
      metric,
      new Date(startTime),
      new Date(endTime),
      interval
    );

    if (!telemetry || telemetry.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No aggregated data available",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: telemetry.length,
      data: telemetry,
    });
  } catch (error) {
    console.error("Error getting aggregated telemetry:", error);
    return errorHandler.handle(res, error);
  }
};

// Get available metrics
export const getAvailableMetrics = async (req, res) => {
  try {
    const { controllerId } = req.params;

    if (!controllerId || controllerId.trim() === "") {
      return errorHandler.missingField(res, "Controller ID");
    }

    const metrics = await TelemetryService.getAvailableMetrics(controllerId);

    if (!metrics || metrics.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No metrics found for this controller",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: metrics.length,
      data: metrics,
    });
  } catch (error) {
    console.error("Error getting available metrics:", error);
    return errorHandler.handle(res, error);
  }
};

// Delete old telemetry (cleanup - admin only)
export const deleteOldTelemetry = async (req, res) => {
  try {
    const { daysOld = 90 } = req.query;

    const result = await TelemetryService.deleteOldTelemetry(
      parseInt(daysOld)
    );

    return res.status(200).json({
      status: "success",
      message: `Deleted ${result.deletedCount} old telemetry records`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting old telemetry:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
