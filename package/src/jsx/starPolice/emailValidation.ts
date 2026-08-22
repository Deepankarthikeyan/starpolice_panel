const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

export function validateEmailOrThrow(email: string): string {
  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }
  return email.trim().toLowerCase();
}
