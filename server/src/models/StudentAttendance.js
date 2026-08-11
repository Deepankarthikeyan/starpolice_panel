import mongoose from "mongoose";

export const ATTENDANCE_STATUSES = ["present", "absent", "late", "leave"];

const studentAttendanceSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, trim: true },
    studentOnboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentOnboarding",
      required: true,
    },
    status: { type: String, enum: ATTENDANCE_STATUSES, required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

studentAttendanceSchema.index({ date: 1, studentOnboardingId: 1 }, { unique: true });
studentAttendanceSchema.index({ date: -1 });
studentAttendanceSchema.index({ studentOnboardingId: 1, date: -1 });

export default mongoose.model("StudentAttendance", studentAttendanceSchema);
