import Command from "../models/command.model.js";
import Device from "../models/device.model.js";

const createCommand = async (req, res) => {
  const data = req.body;
  await Command.create(data);
  return res.send("success");
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
