import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { validateEmailOrThrow } from "../utils/emailValidation.js";
import {
  AUTH_TOKEN_EXPIRY_MS,
  OTP_EXPIRY_MS,
  generateAuthToken,
  generateOtp,
  generatePlaceholderPassword,
  hashAuthToken,
  hashOtp,
  hashPendingPassword,
} from "../utils/authTokens.js";
import { sendPasswordEmail } from "./email.js";

export function panelForRole(role) {
  if (role === "staff") return "staff";
  if (role === "student") return "student";
  return "admin";
}

export function roleMatchesPanel(role, panel) {
  if (panel === "admin") return role === "superadmin" || role === "admin";
  if (panel === "staff") return role === "staff";
  if (panel === "student") return role === "student";
  return false;
}

function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

export async function findUserByAuthToken(token) {
  if (!token?.trim()) return null;
  const tokenHash = hashAuthToken(token.trim());
  const user = await User.findOne({
    authTokenHash: tokenHash,
    authTokenExpires: { $gt: new Date() },
  });
  return user;
}

export function validatePasswordPair(password, confirmPassword) {
  if (!password || !confirmPassword) {
    throw new Error("Password and confirm password are required.");
  }
  if (password !== confirmPassword) {
    throw new Error("Password and confirm password must match.");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
}

export async function issueAuthToken(user, purpose) {
  const token = generateAuthToken();
  user.authTokenHash = hashAuthToken(token);
  user.authTokenExpires = new Date(Date.now() + AUTH_TOKEN_EXPIRY_MS);
  user.authTokenPurpose = purpose;
  user.otpHash = null;
  user.otpExpires = null;
  user.pendingPasswordHash = null;
  await user.save();
  return token;
}

export async function sendSetupInvite(user, panel, clientUrl) {
  const token = await issueAuthToken(user, "setup");
  const result = await sendPasswordEmail({
    to: user.email,
    name: user.name,
    panel,
    purpose: "setup",
    token,
    clientUrl,
  });
  return { token, emailResult: result };
}

export async function sendResetInvite(user, panel, clientUrl) {
  const token = await issueAuthToken(user, "reset");
  const result = await sendPasswordEmail({
    to: user.email,
    name: user.name,
    panel,
    purpose: "reset",
    token,
    clientUrl,
  });
  return { token, emailResult: result };
}

export async function getTokenInfo(token) {
  const user = await findUserByAuthToken(token);
  if (!user) {
    return { valid: false };
  }

  return {
    valid: true,
    purpose: user.authTokenPurpose,
    panel: panelForRole(user.role),
    email: maskEmail(user.email),
    name: user.name,
  };
}

export async function requestOtpForToken(token, password, confirmPassword) {
  validatePasswordPair(password, confirmPassword);

  const user = await findUserByAuthToken(token);
  if (!user) {
    throw new Error("This link is invalid or has expired. Request a new email.");
  }

  const otp = generateOtp();
  user.pendingPasswordHash = await hashPendingPassword(password);
  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  const panel = panelForRole(user.role);
  const emailResult = await sendPasswordEmail({
    to: user.email,
    name: user.name,
    panel,
    purpose: user.authTokenPurpose,
    token,
    otp,
    isOtpOnly: true,
  });

  return { email: maskEmail(user.email), emailResult };
}

export async function resendOtpForToken(token) {
  const user = await findUserByAuthToken(token);
  if (!user) {
    throw new Error("This link is invalid or has expired. Request a new email.");
  }
  if (!user.pendingPasswordHash) {
    throw new Error("Enter your new password first to receive a verification code.");
  }

  const otp = generateOtp();
  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  const panel = panelForRole(user.role);
  const emailResult = await sendPasswordEmail({
    to: user.email,
    name: user.name,
    panel,
    purpose: user.authTokenPurpose,
    token,
    otp,
    isOtpOnly: true,
  });

  return { email: maskEmail(user.email), emailResult };
}

export async function verifyOtpForToken(token, otp) {
  if (!otp?.trim()) {
    throw new Error("Verification code is required.");
  }

  const user = await findUserByAuthToken(token);
  if (!user) {
    throw new Error("This link is invalid or has expired. Request a new email.");
  }

  if (!user.otpHash || !user.otpExpires || user.otpExpires <= new Date()) {
    throw new Error("Verification code expired. Request a new code.");
  }

  if (hashOtp(otp.trim()) !== user.otpHash) {
    throw new Error("Invalid verification code.");
  }

  if (!user.pendingPasswordHash) {
    throw new Error("Password setup session expired. Start again from your email link.");
  }

  const purpose = user.authTokenPurpose;

  user.password = user.pendingPasswordHash;
  user.pendingPasswordHash = null;
  user.otpHash = null;
  user.otpExpires = null;
  user.authTokenHash = null;
  user.authTokenExpires = null;
  user.authTokenPurpose = null;
  user.emailVerified = true;

  if (purpose === "setup") {
    user.isActive = true;
  }

  await user.save();

  return {
    panel: panelForRole(user.role),
    purpose,
  };
}

function panelDisplayName(panel) {
  if (panel === "staff") return "Staff";
  if (panel === "student") return "Student";
  return "Admin";
}

export async function handleForgotPassword(email, panel, clientUrl) {
  const normalizedEmail = validateEmailOrThrow(email);

  if (!["admin", "staff", "student"].includes(panel)) {
    throw new Error("Invalid panel.");
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new Error("No account found with this email address.");
  }

  if (!roleMatchesPanel(user.role, panel)) {
    throw new Error(
      `This email is not registered for the ${panelDisplayName(panel)} panel. Use the correct login page for your account type.`,
    );
  }

  if (user.role === "superadmin") {
    throw new Error("Super admin password reset is not available here. Contact system support.");
  }

  const { emailResult } = await sendResetInvite(user, panel, clientUrl);
  return {
    sent: true,
    delivered: emailResult?.delivered ?? false,
    devMode: emailResult?.devMode ?? false,
    setupUrl: emailResult?.setupUrl,
  };
}

export async function createInvitedUser({
  name,
  email,
  role,
  permissions,
  staffType,
  subjectIds,
  createdBy,
  username,
  clientUrl,
}) {
  const normalizedEmail = validateEmailOrThrow(email);

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error("Email is already registered.");
  }

  const placeholder = await bcrypt.hash(generatePlaceholderPassword(), 10);
  const userData = {
    name: name.trim(),
    email: normalizedEmail,
    password: placeholder,
    role,
    isActive: false,
    emailVerified: false,
    permissions,
    createdBy,
  };

  if (username) {
    userData.username = username.trim().toLowerCase();
  }
  if (staffType) {
    userData.staffType = staffType;
  }
  if (subjectIds?.length) {
    userData.subjectIds = subjectIds;
  }

  const user = await User.create(userData);
  const panel = panelForRole(role);
  const { emailResult } = await sendSetupInvite(user, panel, clientUrl);

  return { user, panel, emailResult };
}
