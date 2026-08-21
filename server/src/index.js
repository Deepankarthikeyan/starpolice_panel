import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDBWithRetry, isDbConnected } from "./config/db.js";
import { getMongoUriIssue, getMongoStorageKind } from "./config/production.js";
import { getJwtSecret } from "./config/jwt.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/uploads.js";
import messageRoutes from "./routes/messages.js";
import noteRoutes from "./routes/notes.js";
import alertRoutes from "./routes/alerts.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";
import studentOnboardingRoutes from "./routes/studentOnboarding.js";
import leadRoutes from "./routes/leads.js";
import dashboardRoutes from "./routes/dashboard.js";
import studentPerformanceRoutes from "./routes/studentPerformance.js";
import studentAttendanceRoutes from "./routes/studentAttendance.js";
import subjectRoutes from "./routes/subjects.js";
import examRoutes from "./routes/exams.js";
import { uploadDir } from "./middleware/upload.js";
import { backfillAttendancePermission } from "./migrations/backfillAttendancePermission.js";
import { stripLeadsFromStaff } from "./migrations/stripLeadsFromStaff.js";
import { fixUsernameIndex } from "./migrations/fixUsernameIndex.js";
import { cleanupAgentTestSuperAdmins } from "./migrations/cleanupAgentTestSuperAdmins.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (_req, res) => {
  const mongoIssue = getMongoUriIssue();
  const connected = isDbConnected();
  res.json({
    status: mongoIssue ? "misconfigured" : connected ? "ok" : "starting",
    database: connected ? "mongodb" : mongoIssue ? "missing" : "connecting",
    storage: getMongoStorageKind(),
    setupRequired: mongoIssue,
    jwt: Boolean(process.env.JWT_SECRET?.trim()),
    build: process.env.RENDER_GIT_COMMIT?.slice(0, 7) || "local",
    features: {
      messageContacts: true,
      usernameIndexFix: true,
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student-onboarding", studentOnboardingRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/student-performance", studentPerformanceRoutes);
app.use("/api/student-attendance", studentAttendanceRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/exams", examRoutes);

app.use((error, _req, res, _next) => {
  res.status(500).json({ message: error.message || "Server error" });
});

async function runMigrations() {
  for (const [label, task] of [
    ["cleanupAgentTestSuperAdmins", cleanupAgentTestSuperAdmins],
    ["fixUsernameIndex", fixUsernameIndex],
    ["backfillAttendancePermission", backfillAttendancePermission],
    ["stripLeadsFromStaff", stripLeadsFromStaff],
  ]) {
    try {
      await task();
    } catch (error) {
      console.error(`Migration ${label} failed:`, error);
    }
  }
}

async function connectDatabaseInBackground() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Start via ./start.sh or set an Atlas URI.");
    return;
  }

  try {
    await connectDBWithRetry(uri, { maxAttempts: 20, retryMs: 2500 });
    await runMigrations();
  } catch (error) {
    console.error("Database startup failed:", error.message);
  }
}

async function start() {
  getJwtSecret();
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });

  void connectDatabaseInBackground();
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
