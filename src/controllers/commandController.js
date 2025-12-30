import CommandService from "../services/commandService.js";
import Command from "../models/commandModel.js";
import { errorHandler } from "../utils/errorHandler.js";

// Create new command (kept for backwards compatibility)
const createCommand = async (req, res) => {
  try {
    const data = req.body;
    const command = await Command.create(data);
    return res.status(201).json({
      status: "success",
      data: command,
    });
  } catch (error) {
    console.error("Error creating command:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get commands for user
export const getCommands = async (req, res) => {
  try {
    const user_id = req.user?._id;
    const { limit = 100 } = req.query;

    if (!user_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    const commands = await CommandService.getCommandsByUser(user_id, parseInt(limit));

    if (!commands || commands.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No commands found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: commands.length,
      data: commands,
    });
  } catch (error) {
    console.error("Error getting commands:", error);
    return errorHandler.handle(res, error);
  }
};

// Get command by ID
export const getCommandById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?._id;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "Command ID");
    }

    if (!user_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    const command = await CommandService.getCommandById(id, user_id);

    if (!command) {
      return errorHandler.notFound(res, "Command");
    }

    return res.status(200).json({
      status: "success",
      data: command,
    });
  } catch (error) {
    console.error("Error getting command:", error);
    return errorHandler.handle(res, error);
  }
};

// Update command status
export const updateCommandStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, error: errorMsg } = req.body;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "Command ID");
    }

    if (!status || status.trim() === "") {
      return errorHandler.missingField(res, "Status");
    }

    const validStatuses = ["queued", "sent", "acked", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const additionalData = {};
    if (errorMsg) additionalData.error = errorMsg;

    const command = await CommandService.updateCommandStatus(id, status, additionalData);

    if (!command) {
      return errorHandler.notFound(res, "Command");
    }

    return res.status(200).json({
      status: "success",
      message: "Command status updated",
      data: command,
    });
  } catch (error) {
    console.error("Error updating command status:", error);
    return errorHandler.handle(res, error);
  }
};

// Get commands by status
export const getCommandsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const user_id = req.user?._id || req.query.user_id;

    const commands = await CommandService.getCommandsByStatus(status, user_id);
    return res.status(200).json({
      status: "success",
      count: commands.length,
      data: commands,
    });
  } catch (error) {
    console.error("Error getting commands by status:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get pending commands
export const getPendingCommands = async (req, res) => {
  try {
    const { controllerId } = req.query;

    const commands = await CommandService.getPendingCommands(controllerId);
    return res.status(200).json({
      status: "success",
      count: commands.length,
      data: commands,
    });
  } catch (error) {
    console.error("Error getting pending commands:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

import mqtt from "mqtt";

let options = {
  host: process.env.MQTT_BROKER_URL,
  port: 8883,
  protocol: "mqtts",
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};

const mqttClient = mqtt.connect(options);

mqttClient.on("connect", () => {
  console.log("MQTT connected");
});

mqttClient.on("error", (err) => {
  console.error("MQTT Error:", err);
});

const sendCommand = async (req, res) => {
  try {
    const { id, cmd } = req.params;

    // 1. Lấy device
    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // 2. Lấy command
    const command = await Command.findById(cmd);
    if (!command) {
      return res.status(404).json({ error: "Command not found" });
    }

    // 3. Chuẩn bị payload IR gửi cho ESP32
    let payload = {};

    if (command.protocol === "RAW") {
      payload = {
        protocol: "RAW",
        freq: command.freq,
        rawdata: command.rawdata,
        commandName: command.name,
      };
    } else {
      payload = {
        protocol: command.protocol,
        bits: command.bits,
        data: command.data,
        commandName: command.name,
      };
    }

    // 4. MQTT topic cho ESP32
    const topic = `iot/devices/${device._id}/ir/send`;

    // 5. Publish MQTT
    mqttClient.publish(topic, JSON.stringify(payload));

    return res.json({
      message: "IR command published to MQTT",
      topic,
      sentData: payload,
    });
  } catch (error) {
    console.error("Error sending command via MQTT:", error);
    return res.status(500).json({ error: "Failed to publish IR command" });
  }
};

export { createCommand, sendCommand };
