import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
    controller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Controller",
      required: true, // ESP publish dữ liệu
    },

    // appliance_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Appliance", // (Tuỳ chọn) nếu sensor gắn theo thiết bị cụ thể
    // },

    metric: {
      type: String,
      required: true,
      maxlength: 50, // Loại dữ liệu: temp / humid / light / gas...
    },

    value: {
      type: Number,
      required: true, // Giá trị đo: 25.6, 60.2...
    },

    unit: {
      type: String,
      maxlength: 20, // Đơn vị: C, %, ppm... (tuỳ chọn)
    },

    topic: {
      type: String,
      maxlength: 200, // Topic nguồn (vd device/<id>/temp)
    },

    ts: {
      type: Date,
      required: true,
      default: Date.now, // Thời điểm đo, gửi từ esp về (QUAN TRỌNG)
    },

    // created_at: {
    //   type: Date,
    //   default: Date.now,
    //   required: true, // Thời điểm BE lưu vào DB
    // },
  },
  { timestamps: true }
);

// Index để tối ưu tìm kiếm time-series
telemetrySchema.index({ controller_id: 1, ts: -1 });
telemetrySchema.index({ metric: 1, ts: -1 });
telemetrySchema.index({ created_at: -1 });

export default mongoose.model("Telemetry", telemetrySchema);
