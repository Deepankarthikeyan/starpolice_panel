export function isRenderProduction() {
  return Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
}

export function getMongoStorageKind() {
  const uri = process.env.MONGODB_URI?.trim() || "";
  if (!uri) return "missing";
  if (uri.includes("127.0.0.1") || uri.includes("localhost")) return "embedded";
  return "atlas";
}

export function getMongoUriIssue() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    return "MONGODB_URI is not set. The API start script should start embedded MongoDB, or set an Atlas URI in Render → Environment.";
  }

  return null;
}
