// src/services/commandAckService.js
import CommandService from "./commandService.js";

export async function handleAck(io, topic, payloadBuffer) {
  let data;
  try {
    data = JSON.parse(payloadBuffer.toString());
  } catch {
    console.warn("[ACK] Invalid JSON payload:", payloadBuffer.toString());
    return;
  }

  const { command_id, status, ack_at } = data;

  if (!command_id || !status) {
    console.warn("[ACK] Missing command_id or status:", data);
    return;
  }

  console.log(`[ACK] Received ACK for command ${command_id}: ${status}`);

  try {
    const updated = await CommandService.updateCommand(
      command_id,
      null, // server-side update, no user filter
      {
        status,
        ack_at: ack_at ? new Date(ack_at) : new Date(),
      }
    );

    if (!updated) {
      console.warn(`[ACK] Command not found: ${command_id}`);
      return;
    }

    console.log(`[ACK] Updated command ${command_id} -> ${status}`);

    // 🔊 Emit realtime to FE
    io.emit("command:ack", {
      command_id,
      status,
      ack_at: updated.ack_at,
    });
  } catch (err) {
    console.error("[ACK]  Failed to update command:", err.message);
  }
}
