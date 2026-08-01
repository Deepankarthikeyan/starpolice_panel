import mongoose from "mongoose";

export const LEAD_STATUSES = ["new", "follow_up", "rejected", "converted"];

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: "" },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    mobileNumber: { type: String, trim: true, default: "" },
    alternateMobileNumber: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    course: { type: String, trim: true, default: "" },
    batch: { type: String, trim: true, default: "" },
    previousQualification: { type: String, trim: true, default: "" },
    careerGoal: { type: String, trim: true, default: "" },
    source: {
      type: String,
      enum: ["website", "walk_in", "referral", "social_media", "phone", "other"],
      default: "other",
    },
    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    followUpNotes: { type: String, default: "" },
    nextFollowUpDate: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    rejectedAt: { type: Date, default: null },
    convertedStudentOnboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentOnboarding",
      default: null,
    },
    convertedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    convertedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

leadSchema.index({ leadId: 1 });
leadSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Lead", leadSchema);
