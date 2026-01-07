// src/services/telemetryIngestService.js
import mongoose from "mongoose";
import Telemetry from "../models/telemetryModel.js";
import Controller from "../models/controllerModel.js";

export function createTelemetryIngestService({ io }) {
  const MAX_BATCH = Number(process.env.TELEMETRY_BATCH_SIZE || 200); // 200 mẫu thì flush
  const FLUSH_INTERVAL = Number(process.env.TELEMETRY_FLUSH_MS || 1000); // đủ 1s thì flush

  const buffer = [];
  let flushTimer = null;

  // cache uuid -> controllerId
  const controllerCache = new Map();
  const CACHE_TTL = 5 * 60 * 1000;

  // xử lý topic
  function parseTopic(topic) {
    // device/<uuid>/data
    const parts = topic.split("/");
    if (parts.length !== 3) return null;
    if (parts[0] !== "device" || parts[2] !== "data") return null;
    return parts[1];
  }

  // xử lý controller id
  async function resolveControllerId(controllerId) {
    const cached = controllerCache.get(controllerId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.id;
    }

      // Nếu input là string, convert sang ObjectId
    const _id = mongoose.Types.ObjectId.isValid(controllerId)
        ? new mongoose.Types.ObjectId(controllerId)
        : null;

    if (!_id) {
        throw new Error("Invalid controller ID");
    }

    // Tìm controller bằng _id
    const controller = await Controller.findById(_id).select("_id");



    if (!controller) {
        console.warn(`Ko thấy controller: ${controllerId}`)
        return null;
    }

    controllerCache.set(controllerId, {
      id: controller._id.toString(),
      expiresAt: Date.now() + CACHE_TTL,
    });

    return controller._id.toString();
  }

  function parsePayload(payload) {
    try {
      const d = JSON.parse(payload.toString("utf8"));

      const metric = d.metric;
      const value = d.value;
      const unit = d.unit;
      const ts = d.ts ? new Date(d.ts) : new Date();

      if (!metric || value === undefined || isNaN(ts.getTime())) {
        console.warn(`[INGEST] Thiếu trường: ${topic}`)
        return null;
      }

      return {
        metric,
        value: Number(value),
        unit,
        ts,
      };
    } catch {
      return null;
    }
  }

  // đẩy data, xoá cache
  async function flush() {
    if (buffer.length === 0) return;

    const docs = buffer.splice(0, buffer.length);

    try {
      await Telemetry.insertMany(docs, { ordered: false });
      // console.log("[Telemetry] Inserted:", docs.length);
    } catch (err) {
      console.error("[Telemetry] insertMany error:", err.message);
    }
  }

  // hết time cx đẩy
  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(async () => {
      flushTimer = null;
      await flush();
    }, FLUSH_INTERVAL);
  }

  // emit
  async function ingest(topic, payload) {
    console.log(`\n[INGEST] MQTT RX topic=${topic}`);

    const controllerUuid = parseTopic(topic);
    if (!controllerUuid) {
        console.warn(`[INGEST] Invalid topic format: ${topic}`);
        return;
    }

    console.log(`[INGEST] Parsed controllerUuid=${controllerUuid}`);

    const data = parsePayload(payload);
    if (!data) {
        console.warn(
        `[INGEST] Payload invalid or missing fields: ${payload.toString()}`
        );
        return;
    }

    console.log(
        `[INGEST] Parsed payload metric=${data.metric} value=${data.value} unit=${data.unit} ts=${data.ts}`
    );

    const controllerId = await resolveControllerId(controllerUuid);
    if (!controllerId) {
        console.warn(
        `[INGEST] Controller not found for uuid=${controllerUuid} => DROP`
        );
        return;
    }

    console.log(`[INGEST] Resolved controllerId=${controllerId}`);

    // 1) Realtime emit
    console.log(
        `[INGEST] Emit telemetry:new to room controller:${controllerId}`
    );
    io.to(`controller:${controllerId}`).emit("telemetry:new", {
        controller_id: controllerId,
        metric: data.metric,
        value: data.value,
        unit: data.unit,
        ts: data.ts.toISOString(),
    });

    // 2) Push to buffer
    buffer.push({
        controller_id: controllerId,
        metric: data.metric,
        value: data.value,
        unit: data.unit,
        ts: data.ts,
        created_at: new Date(),
    });

    console.log(
        `[INGEST] Buffered (${buffer.length}/${MAX_BATCH}) pending writes`
    );

    if (buffer.length >= MAX_BATCH) {
        console.log(`[INGEST] 🚨 Max batch reached -> flush now`);
        await flush();
    } else {
        scheduleFlush();
    }
    }


  return { ingest };
}
