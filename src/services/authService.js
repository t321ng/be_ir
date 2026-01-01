import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";
import { sendEmail } from "../config/email.js";
import { signAccessToken } from "../utils/jwt.js";
import ApiError from "../utils/apiError.js";

const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SALT_ROUNDS = 10;

function generateVerificationCode() {
  const code = crypto.randomInt(100000, 999999).toString();
  const hash = crypto.createHash("sha256").update(code).digest("hex");
  return { code, hash };
}

export async function register({ email, password, username }) {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const existingByEmail = await User.findOne({ email });
  if (existingByEmail) {
    throw new ApiError(409, "Email is already registered");
  }

  const baseUsername = username || email.split("@")[0];
  let finalUsername = baseUsername;
  let suffix = 0;
  // ensure unique username
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existingUser = await User.findOne({ username: finalUsername });
    if (!existingUser) break;
    suffix += 1;
    finalUsername = `${baseUsername}${suffix}`;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const { code, hash } = generateVerificationCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

  const user = await User.create({
    email,
    username: finalUsername,
    password_hash: passwordHash,
    is_verified: false,
    verification_code_hash: hash,
    verification_code_expires: expiresAt,
    verification_last_sent_at: new Date(),
  });

  await sendEmail({
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}. It will expire in 15 minutes.`,
  });

  return {
    id: user._id,
    email: user.email,
    username: user.username,
    is_verified: user.is_verified,
  };
}

export async function verifyEmail({ email, code }) {
  if (!email || !code) {
    throw new ApiError(400, "Email and code are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.is_verified) {
    return { message: "Email already verified" };
  }

  if (!user.verification_code_hash || !user.verification_code_expires) {
    throw new ApiError(400, "No verification code found. Please register again.");
  }

  if (user.verification_code_expires < new Date()) {
    throw new ApiError(400, "Verification code has expired");
  }

  const incomingHash = crypto.createHash("sha256").update(code).digest("hex");
  if (incomingHash !== user.verification_code_hash) {
    throw new ApiError(400, "Invalid verification code");
  }

  user.is_verified = true;
  user.verification_code_hash = undefined;
  user.verification_code_expires = undefined;
  await user.save();

  return { message: "Email verified successfully" };
}

export async function login({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.is_verified) {
    throw new ApiError(403, "Email is not verified");
  }

  const token = signAccessToken({ _id: user._id.toString(), role: user.role });

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
}

export async function resendVerification({ email }) {
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.is_verified) {
    return { message: "Email already verified" };
  }

  const { code, hash } = generateVerificationCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

  user.verification_code_hash = hash;
  user.verification_code_expires = expiresAt;
  user.verification_last_sent_at = new Date();
  await user.save();

  await sendEmail({
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}. It will expire in 15 minutes.`,
  });

  return { message: "Verification code resent" };
}
