import express from "express";
import {
  registerController,
  verifyEmailController,
  loginController,
  resendVerificationController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/verify-email", verifyEmailController);
router.post("/login", loginController);
router.post("/resend-code", resendVerificationController);

export default router;
