import crypto from "crypto";

export function getJwtSecret() {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const generated = crypto.randomBytes(32).toString("hex");
  process.env.JWT_SECRET = generated;
  console.warn(
    "JWT_SECRET is not set. Using a generated secret for this process. Set JWT_SECRET in Render → Environment to keep logins across restarts."
  );
  return generated;
}
