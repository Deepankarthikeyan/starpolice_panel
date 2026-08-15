import mongoose from "mongoose";

const performanceEventSchema = new mongoose.Schema(
  {
    eventKey: { type: String, required: true },
    performance: { type: String, default: "" },
    singleStar: { type: String, default: "" },
    doubleStar: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { _id: false }
);

const studentPerformanceSchema = new mongoose.Schema(
  {
    studentOnboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentOnboarding",
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cardType: {
      type: String,
      enum: ["female", "male"],
      required: true,
    },
    recordYear: { type: Number, default: () => new Date().getFullYear() },
    recordDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    age: { type: String, default: "" },
    heightCm: { type: String, default: "" },
    weightKg: { type: String, default: "" },
    chestNormalCm: { type: String, default: "" },
    chestExpansionCm: { type: String, default: "" },
    events: { type: [performanceEventSchema], default: [] },
    attendancePresent: { type: String, default: "" },
    attendanceAbsent: { type: String, default: "" },
    attendanceLeave: { type: String, default: "" },
    overallPerformance: {
      type: String,
      enum: ["", "excellent", "very_good", "good", "average"],
      default: "",
    },
    trainerRemarks: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

studentPerformanceSchema.index({ studentOnboardingId: 1 });
studentPerformanceSchema.index({ userId: 1 });

export default mongoose.model("StudentPerformance", studentPerformanceSchema);
