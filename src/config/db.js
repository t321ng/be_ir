import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  await mongoose.connect(process.env.DB_URL);
  console.log("Connect to DB thành công");
};

export default connectDB;
