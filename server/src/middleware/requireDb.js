import mongoose from "mongoose";
import { getMongoUriIssue } from "../config/production.js";

export function requireDb(_req, res, next) {
  const mongoIssue = getMongoUriIssue();
  if (mongoIssue) {
    return res.status(503).json({ message: mongoIssue });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is still starting. Wait 30 seconds and try again.",
    });
  }
  next();
}
