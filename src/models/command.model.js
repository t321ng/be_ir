import mongoose from "mongoose";

const commandSchema = new mongoose.Schema(
  {
    device_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    // Protocol: NEC / SONY / RC5 / RAW / ...
    protocol: {
      type: String,
      required: true,
    },

    // HEX format (optional nếu RAW)
    data: {
      type: String, // ví dụ "0x20DF10EF"
    },

    // Số bit của mã (NEC = 32bit, Sony = 12bit…)
    bits: {
      type: Number,
    },

    // RAW format
    rawdata: {
      type: [Number], // mảng số thời gian xung
    },

    // Tần số khi RAW
    freq: {
      type: Number, // ví dụ 38000
    },
  },
  { timestamps: true }
);

export default mongoose.model("Command", commandSchema);
