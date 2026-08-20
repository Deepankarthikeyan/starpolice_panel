import mongoose from "mongoose";

export function requireDb(_req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is not ready yet. Wait a few seconds and try again.",
    });
  }
  next();
}
