import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/index.js";

dotenv.config();

// express chạy so match từ trên xuống dưới, chạy từ top -> bottom (nếu có next())
// gọi next()       -> tìm middleware KHÔNG có err ở tham số đầu tiên:   (req, res) hoặc (req, res, next)
// gọi next(err)    -> tìm middleware có err ở tham số đầu tiên:         (err, req, res, next)
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware: allow all origins
app.use(cors());

// API Routes (prefix cho các endpoint trong apiRoute)
app.use("/api", apiRoutes);

// liệt kê các endpoint đang có
app.get("/", (req, res) => { // method là GET, path là "/"
  res.json({
    message: "IoT IR Control Backend API",
    version: "1.0.0",
    endpoints: {
      authRegister: "/api/auth/register",
      authVerifyEmail: "/api/auth/verify-email",
      authLogin: "/api/auth/login",
      users: "/api/users",
      rooms: "/api/rooms",
      controllers: "/api/controllers",
      appliances: "/api/appliances",
      irCodes: "/api/ir-codes",
      commands: "/api/commands",
      telemetry: "/api/telemetry",
      health: "/api/health",
    },
  });
});

// 404 handler (nếu ko match bất kỳ route nào phía trên)
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
}); 

// Error handler 
// khi dùng next(err) hoặc throw new Error(), sẽ chuyển sang ERROR MODE,
// sẽ nhảy tới middleware có tham số error ở đầu
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
  console.log(`API Documentation: http://localhost:${PORT}/`);
});
