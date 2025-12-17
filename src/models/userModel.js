import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100, // Giới hạn độ dài tối đa của username
    },

    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 150, // Giới hạn độ dài tối đa của email
    },

    password_hash: {
      type: String,
      required: true,
      maxlength: 255, // Giới hạn độ dài tối đa của password_hash
    },

    role: {
      type: String,
      required: true,
      default: 'user', // Phân quyền mặc định là 'user'
      enum: ['user', 'admin'], // Chỉ cho phép hai giá trị: user hoặc admin
    },

    created_at: {
      type: Date,
      default: Date.now, // Mặc định sẽ là thời điểm tạo tài khoản
      required: true,
    },

    updated_at: {
      type: Date,
    },
  },
  { timestamps: true } // Mongoose sẽ tự động thêm `created_at` và `updated_at`
);

export default mongoose.model("User", userSchema);
