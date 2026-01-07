// src/mqtt/mqttClient.js
import mqtt from "mqtt";

let client = null;

export function initMqtt({ onMessage }) {
  const options = {
    host: process.env.MQTT_BROKER_URL,
    port: Number(process.env.MQTT_PORT || 8883),
    protocol: process.env.MQTT_PROTOCOL || "mqtts",
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 2000,
  };

  client = mqtt.connect(options);

  client.on("connect", () => {
    console.log("[MQTT] Connected");

    const topics = ["device/+/data", "device/+/ack"];

    topics.forEach((t) => {
      client.subscribe(t, { qos: 0 }, (err) => {
        if (err) console.error(`[MQTT] Subscribe error for ${t}:`, err);
        else console.log(`[MQTT] Subscribed: ${t}`);
      });
    });
  });

  client.on("message", (topic, payload) => {
    try {
      onMessage(topic, payload);
    } catch (err) {
      console.error("[MQTT] Message handler error:", err);
    }
  });

  client.on("error", (err) => {
    console.error("[MQTT] Error:", err.message);
  });

  return client;
}

export function getMqttClient() {
  return client;
}
