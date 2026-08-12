import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    examType: {
      type: String,
      enum: ["physical_exam", "written_exam"],
      required: true,
    },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    totalMarks: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

examSchema.index({ examType: 1, name: 1 });

export default mongoose.model("Exam", examSchema);
