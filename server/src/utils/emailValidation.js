const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function validateEmailOrThrow(email) {
  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }
  return normalizeEmail(email);
}
