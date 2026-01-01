import jwt from "jsonwebtoken";
import ApiError from "./apiError.js";

const JWT_SECRET = process.env.JWT_SECRET;

export function signAccessToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || "1h") {
  if (!JWT_SECRET) {
    throw new ApiError(500, "JWT_SECRET is not configured");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyAccessToken(token) {
  if (!JWT_SECRET) {
    throw new ApiError(500, "JWT_SECRET is not configured");
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
}
