import nodemailer from "nodemailer";

let transporter = null;

function getClientUrl() {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim());
}

function getTransporter() {
  if (transporter) return transporter;

  if (!isEmailConfigured()) {
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
  return process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@starpolice.academy";
}

function panelLabel(panel) {
  if (panel === "staff") return "Staff Panel";
  if (panel === "student") return "Student Panel";
  return "Admin Panel";
}

function purposeLabel(purpose) {
  return purpose === "reset" ? "Reset your password" : "Set up your password";
}

export async function sendPasswordEmail({
  to,
  name,
  panel,
  purpose,
  token,
  otp,
  isOtpOnly = false,
}) {
  const clientUrl = getClientUrl();
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
      <p><a href="${setupUrl}">Continue to password setup</a></p>
      <p>Or copy this link: ${setupUrl}</p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

  const mail = {
    from: getFromAddress(),
    to,
    subject,
    text: textLines.join("\n"),
    html,
  };

  const transport = getTransporter();
  if (!transport) {
    console.log("[email:dev] SMTP not configured — email logged to console:");
    console.log(JSON.stringify({ to, subject, setupUrl, otp: isOtpOnly ? otp : undefined }, null, 2));
    return { delivered: false, devMode: true, setupUrl, otp: isOtpOnly ? otp : undefined };
  }

  await transport.sendMail(mail);
  return { delivered: true, devMode: false };
}
