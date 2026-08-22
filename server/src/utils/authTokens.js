import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getJwtSecret } from "../config/jwt.js";

const TOKEN_BYTES = 32;
const OTP_DIGITS = 6;

function hashValue(value) {
  return crypto.createHash("sha256").update(`${value}:${getJwtSecret()}`).digest("hex");
}

export function generateAuthToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashAuthToken(token) {
  return hashValue(token);
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashOtp(otp) {
  return hashValue(otp);
}

export async function hashPendingPassword(password) {
  return bcrypt.hash(password, 10);
}

export function generatePlaceholderPassword() {
  return crypto.randomBytes(32).toString("hex");
}

export const AUTH_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
export const OTP_EXPIRY_MS = 10 * 60 * 1000;
