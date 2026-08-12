import mongoose from "mongoose";

const studentExamMarkSchema = new mongoose.Schema(
  {
    studentOnboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentOnboarding",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    scoredMarks: { type: Number, default: 0, min: 0 },
    remarks: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

studentExamMarkSchema.index({ studentOnboardingId: 1, examId: 1 }, { unique: true });

export default mongoose.model("StudentExamMark", studentExamMarkSchema);
