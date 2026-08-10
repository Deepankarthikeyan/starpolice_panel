import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
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
import { uploadDir } from "./middleware/upload.js";

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
  res.json({ status: "ok", database: "mongodb" });
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

app.use((error, _req, res, _next) => {
  res.status(500).json({ message: error.message || "Server error" });
});

async function start() {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
