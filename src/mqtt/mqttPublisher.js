// src/mqtt/mqttPublisher.js
import { getMqttClient } from "./mqttClient.js";

export function publish(topic, message, opts = {}) {
  return new Promise((resolve, reject) => {
    const client = getMqttClient();

    if (!client || !client.connected) {
      return reject(new Error("MQTT client not connected"));
    }

    const payload = typeof message === "string" ? message : JSON.stringify(message);

    client.publish(topic, payload, { qos: 0, retain: false, ...opts }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
