import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Chủ sở hữu phòng (1 user - n rooms)
    },

    name: {
      type: String,
      required: true,
      maxlength: 100, // Tên phòng: "Phòng khách", "Phòng ngủ"...
    },

    description: {
      type: String, // Mô tả/ghi chú (tuỳ chọn)
    },

    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
