import ApiError from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {_id: payload._id, role: payload.role };
    return next();
  } catch (err) {
    return next(err);
  }
}
