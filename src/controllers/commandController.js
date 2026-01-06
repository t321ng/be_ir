import CommandService from "../services/commandService.js";
import Command from "../models/commandModel.js";
import Controller from "../models/controllerModel.js";
import Appliance from "../models/applianceModel.js";
import IrCode from "../models/irCodeModel.js";
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

// Update command (full update, not just status)
export const updateCommand = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?._id;
    const updateData = req.body;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "Command ID");
    }

    if (!user_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No data to update",
      });
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ["queued", "sent", "acked", "failed"];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }
    }

    const command = await CommandService.updateCommand(id, user_id, updateData);

    if (!command) {
      return errorHandler.notFound(res, "Command");
    }

    return res.status(200).json({
      status: "success",
      message: "Command updated successfully",
      data: command,
    });
  } catch (error) {
    console.error("Error updating command:", error);
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

  protocolVersion: 4, // MQTT 3.1.1 (BẮT BUỘC)
  clean: true,        // session sạch
  reconnectPeriod: 0,

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

export const sendCommand = async (req, res) => {
  try {
    const user_id = req.user?._id;
    const {
      controller_id,
      appliance_id,
      action,
      payload,
      ir_code_id,
      room_id: roomIdOverride,
    } = req.body;

    if (!user_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    if (!controller_id || !controller_id.trim()) {
      return errorHandler.missingField(res, "Controller ID");
    }

    if (!appliance_id || !appliance_id.trim()) {
      return errorHandler.missingField(res, "Appliance ID");
    }

    if (!action || !action.trim()) {
      return errorHandler.missingField(res, "Action");
    }

    if (!ir_code_id || !ir_code_id.trim()) {
      return errorHandler.missingField(res, "IR Code ID");
    }

    const [controller, appliance] = await Promise.all([
      Controller.findById(controller_id),
      Appliance.findById(appliance_id),
    ]);

    if (!controller) {
      return errorHandler.notFound(res, "Controller");
    }

    if (!appliance) {
      return errorHandler.notFound(res, "Appliance");
    }

    const room_id = roomIdOverride || appliance.room_id;

    // Lấy IR code để publish nội dung mã IR
    const irCode = await IrCode.findById(ir_code_id);
    if (!irCode) {
      return errorHandler.notFound(res, "IR Code");
    }

    // Parse raw_data nếu là JSON array, fallback string nếu parse lỗi
    let parsedRawData = irCode.raw_data;
    if (irCode.raw_data) {
      try {
        parsedRawData = JSON.parse(irCode.raw_data);
      } catch (_e) {
        parsedRawData = irCode.raw_data;
      }
    }

    // Chọn topic publish: ưu tiên cmd_topic, sau đó base_topic/commands, cuối cùng fallback
    const normalizedBase = controller.base_topic
      ? controller.base_topic.replace(/\/$/, "")
      : null;
    const topic =
      controller.cmd_topic ||
      (normalizedBase ? `${normalizedBase}/commands` : `device/${controller._id}/commands`);

    // console.log("payload" + payload);
    // Lưu command ở trạng thái queued, rồi publish và update sent
    const payloadString =
      typeof payload === "string" ? payload : JSON.stringify(payload || {});

    const commandDoc = await CommandService.createCommand({
      user_id,
      controller_id,
      appliance_id,
      room_id,
      ir_code_id,
      action,
      topic,
      payload: payloadString,
      status: "queued",
    });

    const mqttBody = {
      command_id: commandDoc._id,
      action,
      controller_id,
      appliance_id,
      ir_code_id,
      protocol: irCode.protocol,
      frequency: irCode.frequency,
      bits: irCode.bits,
      raw_data: parsedRawData,
      data: irCode.data,
      brand: irCode.brand,
      device_type: irCode.device_type,
    };

    // Đính kèm payload tùy chọn từ FE (metadata thêm)
    if (payload !== undefined) {
      mqttBody.meta = payload;
    }

    // Publish command with error handling
    mqttClient.publish(
      topic,
      JSON.stringify(mqttBody),
      { qos: 0, retain: false }, // QoS 0 (ko cần ack) và ko gửi lại
      async (err) => {
        if (err) {
          console.error("❌ Publish failed:", err);
          // Update command with error status and error message
          await CommandService.updateCommand(
            commandDoc._id,
            user_id,
            { 
              status: "failed", 
              error: `Publish error: ${err.message}` 
            }
          ).catch(e => console.error("Failed to update command on publish error:", e));
        } else {
          console.log("✅ Publish success (broker acknowledged)");
          // Update command status to sent
          await CommandService.updateCommand(
            commandDoc._id,
            user_id,
            { status: "sent", sent_at: new Date() }
          ).catch(e => console.error("Failed to update command on publish success:", e));
        }
      }
    );

    console.log("sending to " + topic);

    return res.status(201).json({
      status: "success",
      message: "Command created and published",
      topic,
      data: commandDoc,
      published_payload: mqttBody,
    });
  } catch (error) {
    console.error("Error sending command via MQTT:", error);
    return errorHandler.handle(res, error);
  }
};

export { createCommand };
