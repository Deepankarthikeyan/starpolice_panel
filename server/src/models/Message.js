import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["admin", "student"], required: true },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
