import nodemailer from "nodemailer";

let transporter = null;

function getClientUrl(requestedUrl) {
  const trimmed = typeof requestedUrl === "string" ? requestedUrl.trim() : "";
  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

export function getEmailProvider() {
  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  if (process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim()) return "smtp";
  return null;
}

export function isEmailConfigured() {
  return Boolean(getEmailProvider());
}

function getTransporter() {
  if (transporter) return transporter;

  if (getEmailProvider() !== "smtp") {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS || "",
    },
  });

  return transporter;
}

function getFromAddress() {
  const from = process.env.EMAIL_FROM?.trim();
  if (from) return from;

  if (getEmailProvider() === "resend") {
    return "Star Police Academy <onboarding@resend.dev>";
  }

  return process.env.SMTP_USER || "noreply@starpolice.academy";
}

function panelLabel(panel) {
  if (panel === "staff") return "Staff Panel";
  if (panel === "student") return "Student Panel";
  return "Admin Panel";
}

function purposeLabel(purpose) {
  return purpose === "reset" ? "Reset your password" : "Set up your password";
}

async function sendViaResend({ to, subject, html, text, from }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || `Resend API error (${response.status})`);
  }

  return { provider: "resend", id: data.id };
}

async function sendViaSmtp(mail) {
  const transport = getTransporter();
  if (!transport) return null;

  const info = await transport.sendMail(mail);
  return { provider: "smtp", id: info.messageId };
}

function logDevFallback(payload) {
  console.log("[email:dev] Email not configured or delivery failed — logged to console:");
  console.log(JSON.stringify(payload, null, 2));
}

export async function sendPasswordEmail({
  to,
  name,
  panel,
  purpose,
  token,
  otp,
  isOtpOnly = false,
  clientUrl: requestedClientUrl,
}) {
  const clientUrl = getClientUrl(requestedClientUrl);
  const setupUrl = `${clientUrl}/auth/setup-password?token=${encodeURIComponent(token)}`;
  const panelName = panelLabel(panel);
  const action = purposeLabel(purpose);

  const subject = isOtpOnly
    ? `Star Police Academy – verification code for ${panelName}`
    : `Star Police Academy – ${action} for ${panelName}`;

  const textLines = isOtpOnly
    ? [
        `Hello ${name || "there"},`,
        "",
        `Your verification code for ${panelName} is: ${otp}`,
        "",
        "This code expires in 10 minutes.",
        "",
        "If you did not request this, you can ignore this email.",
      ]
    : [
        `Hello ${name || "there"},`,
        "",
        `${action} for your ${panelName} account at Star Police Academy.`,
        "",
        `Open this link to continue: ${setupUrl}`,
        "",
        "This link expires in 24 hours.",
        "",
        "If you did not request this, you can ignore this email.",
      ];

  const html = isOtpOnly
    ? `
      <p>Hello ${name || "there"},</p>
      <p>Your verification code for <strong>${panelName}</strong> is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${otp}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `
    : `
      <p>Hello ${name || "there"},</p>
      <p>${action} for your <strong>${panelName}</strong> account at Star Police Academy.</p>
      <p><a href="${setupUrl}" style="display:inline-block;padding:12px 20px;background:#1e3a5f;color:#fff;text-decoration:none;border-radius:6px;">Continue to password setup</a></p>
      <p>Or copy this link: <a href="${setupUrl}">${setupUrl}</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

  const from = getFromAddress();
  const mailPayload = {
    from,
    to,
    subject,
    text: textLines.join("\n"),
    html,
  };

  if (!isEmailConfigured()) {
    logDevFallback({ to, subject, setupUrl, otp: isOtpOnly ? otp : undefined });
    return { delivered: false, devMode: true, setupUrl, otp: isOtpOnly ? otp : undefined };
  }

  try {
    let result = null;

    if (getEmailProvider() === "resend") {
      result = await sendViaResend({
        to,
        subject,
        html: mailPayload.html,
        text: mailPayload.text,
        from,
      });
    } else {
      result = await sendViaSmtp(mailPayload);
    }

    if (!result) {
      throw new Error("Email provider is not available.");
    }

    console.log(`[email] Sent via ${result.provider} to ${to} (id: ${result.id || "ok"})`);
    return { delivered: true, devMode: false, provider: result.provider };
  } catch (error) {
    console.error("[email] Delivery failed:", error.message);
    logDevFallback({ to, subject, setupUrl, otp: isOtpOnly ? otp : undefined, error: error.message });
    return {
      delivered: false,
      devMode: true,
      setupUrl,
      otp: isOtpOnly ? otp : undefined,
      deliveryError: error.message,
    };
  }
}
