import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["tv", "ac", "fan", "light", "custom"],
      default: "custom",
    },

    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Device", deviceSchema);
