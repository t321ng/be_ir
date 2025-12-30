import {
  register,
  verifyEmail,
  login,
  resendVerification,
} from "../services/authService.js";
import ApiError from "../utils/apiError.js";

export const registerController = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const data = await register({ email, password, username });
    res.status(201).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailController = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const data = await verifyEmail({ email, code });
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await login({ email, password });
    // console.log(data);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

export const resendVerificationController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const data = await resendVerification({ email });
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

export const requireAuthController = (req, res, next) => {
  next(new ApiError(401, "Authentication required"));
};
