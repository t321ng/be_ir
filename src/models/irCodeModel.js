import mongoose from "mongoose";

const irCodeSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // (Tuỳ chọn) user tạo/ sở hữu mã (null nếu library chung)
    },

    brand: {
      type: String,
      maxlength: 100, // Hãng (dùng cho library hoặc filter)
    },

    device_type: {
      type: String,
      maxlength: 100, // Loại thiết bị (tv/air_conditioner/...)
    },

    action: {
      type: String,
      required: true,
      maxlength: 100, // Hành động: PowerOn, TempUp, VolDown...
    },

    protocol: {
      type: String,
      required: true,
      default: "raw",
      maxlength: 50, // raw / nec / rc5...
    },

    frequency: {
      type: Number, // Tần số IR (Hz) nếu cần
    },

    bits: {
      type: Number, // Số bit nếu protocol cần
    },

    // Payload lưu mã (thường lưu raw array hoặc string)
    raw_data: {
      type: String, // Chuỗi JSON/mảng raw (vd: [9000,4500,...])
    },

    data: {
      type: String, // Có thể lưu thêm dạng khác (hex/base64) tuỳ implement
    },

    // created_at: {
    //   type: Date,
    //   default: Date.now,
    //   required: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("IrCode", irCodeSchema);
