import mongoose from "mongoose";

const commandSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ai bấm nút gửi lệnh
    },

    controller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Controller",
      required: true, // ESP sẽ nhận lệnh
    },

    appliance_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appliance",
      required: true, // Thiết bị IR mục tiêu
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", // (optional) denormalize để lọc theo phòng nhanh
    },

    ir_code_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IrCode", // Mã IR dùng 
      require: true, // bắt buộc
    },

    action: {
      type: String,
      required: true,
      maxlength: 100, // Hành động FE gửi: PowerOn, TempDown...
    },

    // topic: {
    //   type: String,
    //   maxlength: 200, // Topic BE publish (vd device/<id>/commands)
    // },

    // payload: {
    //   type: String, // Payload publish (json string/base64/...)
    // },

    status: {
      type: String,
      required: true,
      default: "queued",
      enum: ["queued", "sent", "acked", "failed"],
      // queued: đã tạo log, chờ publish
      // sent: đã publish mqtt
      // acked: ESP xác nhận đã thực thi
      // failed: lỗi publish hoặc ESP báo lỗi
    },

    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },

    sent_at: {
      type: Date, // Thời điểm publish mqtt
    },

    ack_at: {
      type: Date, // Thời điểm nhận ack từ ESP
    },

    error: {
      type: String, // Thông tin lỗi nếu failed (timeout, invalid code...)
    },
  },
  // { timestamps: true }
);

// Index để tối ưu tìm kiếm
commandSchema.index({ user_id: 1, created_at: -1 });
commandSchema.index({ controller_id: 1, status: 1 });
commandSchema.index({ appliance_id: 1, created_at: -1 });

export default mongoose.model("Command", commandSchema);
