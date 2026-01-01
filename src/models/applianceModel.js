import mongoose from "mongoose";

const applianceSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Chủ sở hữu thiết bị
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", // Thiết bị nằm trong phòng nào
    },

    controller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Controller",
      required: true, // ESP điều khiển thiết bị này
    },

    name: {
      type: String,
      required: true,
      maxlength: 120, // Tên hiển thị: "Máy lạnh Daikin", "TV Sony"
    },

    brand: {
      type: String,
      maxlength: 100, // Hãng: Daikin, Sony, LG...
    },

    device_type: {
      type: String,
      required: true,
      maxlength: 100, // Loại: air_conditioner / tv / fan / lamp...
    },

    description: {
      type: String, // Ghi chú (tuỳ chọn)
    },

    // created_at: {
    //   type: Date,
    //   default: Date.now,
    //   required: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("Appliance", applianceSchema);
