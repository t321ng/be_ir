import Telemetry from "../models/telemetryModel.js";

class TelemetryService {
  // Create new telemetry entry (Detail populate)
  static async createTelemetry(telemetryData) {
    const telemetry = await Telemetry.create(telemetryData);
    return await Telemetry.findById(telemetry._id).populate("controller_id", "name");
  }

  // Batch create telemetry records (for bulk inserts)
  static async createBulkTelemetry(telemetryDataArray) {
    const telemetry = await Telemetry.insertMany(telemetryDataArray);
    return telemetry;
  }

  // Get telemetry by controller (List - Light populate)
  static async getTelemetryByController(
    controllerId,
    limit = 100,
    metric = null
  ) {
    const query = { controller_id: controllerId };
    if (metric) query.metric = metric;

    const telemetry = await Telemetry.find(query)
      .populate("controller_id", "name")
      .sort({ ts: -1 })
      .limit(limit);
    return telemetry;
  }

  // Get telemetry by time range (List - Light populate)
  static async getTelemetryByTimeRange(
    controllerId,
    startTime,
    endTime,
    metric = null
  ) {
    const query = {
      controller_id: controllerId,
      ts: { $gte: startTime, $lte: endTime },
    };
    if (metric) query.metric = metric;

    const telemetry = await Telemetry.find(query)
      .populate("controller_id", "name")
      .sort({ ts: 1 }); // Ascending for time series
    return telemetry;
  }

  // Get latest telemetry for each metric
  static async getLatestTelemetry(controllerId) {
    const telemetry = await Telemetry.aggregate([
      { $match: { controller_id: controllerId } },
      { $sort: { ts: -1 } },
      {
        $group: {
          _id: "$metric",
          latest: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latest" },
      },
    ]);
    return telemetry;
  }

  // Get telemetry statistics (avg, min, max)
  static async getTelemetryStats(controllerId, metric, startTime, endTime) {
    const query = {
      controller_id: controllerId,
      metric: metric,
      ts: { $gte: startTime, $lte: endTime },
    };

    const stats = await Telemetry.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$metric",
          avg: { $avg: "$value" },
          min: { $min: "$value" },
          max: { $max: "$value" },
          count: { $sum: 1 },
        },
      },
    ]);

    return stats[0] || null;
  }

  // Get aggregated telemetry (hourly/daily averages)
  static async getAggregatedTelemetry(
    controllerId,
    metric,
    startTime,
    endTime,
    interval = "hour"
  ) {
    const query = {
      controller_id: controllerId,
      metric: metric,
      ts: { $gte: startTime, $lte: endTime },
    };

    // Determine grouping based on interval
    let dateFormat;
    if (interval === "hour") {
      dateFormat = "%Y-%m-%d %H:00:00";
    } else if (interval === "day") {
      dateFormat = "%Y-%m-%d";
    } else {
      dateFormat = "%Y-%m-%d %H:%M:00"; // default to minute
    }

    const telemetry = await Telemetry.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$ts" },
          },
          avg: { $avg: "$value" },
          min: { $min: "$value" },
          max: { $max: "$value" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return telemetry;
  }

  // Delete old telemetry (cleanup)
  static async deleteOldTelemetry(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Telemetry.deleteMany({
      ts: { $lt: cutoffDate },
    });
    return result;
  }

  // Get all metrics for a controller
  static async getAvailableMetrics(controllerId) {
    const metrics = await Telemetry.distinct("metric", {
      controller_id: controllerId,
    });
    return metrics;
  }
}

export default TelemetryService;
