import mongoose from "mongoose";

const RETRY_MS = 5000;
const MAX_ATTEMPTS = 30;

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export async function connectDB(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDBWithRetry(uri, { maxAttempts = MAX_ATTEMPTS, retryMs = RETRY_MS } = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => undefined);
      }
      await connectDB(uri);
      return;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt ${attempt}/${maxAttempts} failed:`, error.message);
      if (attempt < maxAttempts) {
        await sleep(retryMs);
      }
    }
  }

  throw lastError ?? new Error("MongoDB connection failed.");
}
