import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["video", "pdf", "image", "document"],
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

export default mongoose.model("Upload", uploadSchema);
