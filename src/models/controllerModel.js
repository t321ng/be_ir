import mongoose from "mongoose";

const controllerSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Chủ sở hữu (ai quản lý ESP)
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", // ESP đặt ở phòng nào (có thể null nếu chưa gán)
    },

    name: {
      type: String,
      required: true,
      maxlength: 120, // Tên hiển thị: "ESP32 phòng khách"
    },

    description: {
      type: String, // Ghi chú (tuỳ chọn)
    },

    // MQTT identity & topics
    mqtt_client_id: {
      type: String,
      maxlength: 150, // ClientId khi ESP connect broker (nếu có)
    },

    base_topic: {
      type: String,
      maxlength: 200, // Prefix topic: vd "device/<controllerId>"
    },

    cmd_topic: {
      type: String,
      maxlength: 200, // Topic nhận lệnh: vd "device/<id>/commands"
    },

    status_topic: {
      type: String,
      maxlength: 200, // Topic trạng thái: vd "device/<id>/status"
    },

    ack_topic: {
      type: String,
      maxlength: 200, // Topic ack: vd "device/<id>/acks" (ESP trả kết quả)
    },

    // Online status
    online: {
      type: Boolean,
      required: true,
      default: false, // Trạng thái online/offline (do BE cập nhật)
    },

    last_seen: {
      type: Date, // Lần cuối BE thấy ESP (heartbeat/status)
    },

    // Capability flags
    has_ir: {
      type: Boolean,
      required: true,
      default: true, // Có module IR blaster không
    },

    has_sensors: {
      type: Boolean,
      required: true,
      default: true, // Có cảm biến không (temp/humid...)
    },

    // created_at: {
    //   type: Date,
    //   default: Date.now,
    //   required: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("Controller", controllerSchema);
