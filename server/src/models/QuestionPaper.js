import mongoose from "mongoose";

const questionPaperSchema = new mongoose.Schema(
  {
    paperName: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["pdf", "image", "document"],
      required: true,
    },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedByName: { type: String, required: true },
  },
  { timestamps: true }
);

questionPaperSchema.index({ date: 1, createdAt: -1 });

export default mongoose.model("QuestionPaper", questionPaperSchema);
