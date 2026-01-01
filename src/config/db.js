import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connect to DB thành công");
};

export default connectDB;
