import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: {
      type: String,
      enum: ["superadmin", "admin", "staff", "student"],
      required: true,
    },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    message: { type: String, required: true, trim: true },
    channel: { type: String, enum: ["group", "private"], default: "group" },
    threadStudentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    threadStaffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    threadAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

messageSchema.index({ channel: 1, createdAt: 1 });
messageSchema.index({ channel: 1, threadStudentId: 1, threadStaffId: 1, threadAdminId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
