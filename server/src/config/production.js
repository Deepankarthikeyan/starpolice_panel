export function isRenderProduction() {
  return Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
}

export function getMongoUriIssue() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    return "MONGODB_URI is not set. Add a MongoDB Atlas connection string in Render → Environment.";
  }

  if (isRenderProduction() && (uri.includes("127.0.0.1") || uri.includes("localhost"))) {
    return "MONGODB_URI must use MongoDB Atlas on Render. Localhost/embedded MongoDB is not supported in production.";
  }

  return null;
}
