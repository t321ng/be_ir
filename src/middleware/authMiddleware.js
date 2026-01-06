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
    req.user = { _id: payload._id, role: payload.role };
    return next();
  } catch (err) {
    return next(err);
  }
}

// Require user to have one of the allowed roles
export function requireRoles(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return next(new ApiError(401, "Authentication required"));
    }
    if (!roles.includes(role)) {
      return next(new ApiError(403, "Forbidden"));
    }
    return next();
  };
}

// Allow if user is the resource owner (matches :id) or has one of the allowed roles
export function allowSelfOrRoles(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    const userId = req.user?._id?.toString();
    const targetId = req.params?.id;

    if (userId && targetId && userId === targetId) {
      return next();
    }

    if (role && roles.includes(role)) {
      return next();
    }

    return next(new ApiError(403, "Forbidden"));
  };
}
