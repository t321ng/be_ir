import nodemailer from "nodemailer";
import ApiError from "../utils/apiError.js";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

if (!host) {
  throw new ApiError(500, "SMTP_HOST is not configured");
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: user && pass ? { user, pass } : undefined,
});

export async function sendEmail({ to, subject, text, html }) {
  if (!to) {
    throw new ApiError(400, "Recipient email is required");
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || user,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    throw new ApiError(500, "Failed to send email");
  }
}
