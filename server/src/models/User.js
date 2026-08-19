import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "admin", "staff", "student"],
      required: true,
    },
    isActive: { type: Boolean, default: false },
    username: { type: String, trim: true, lowercase: true, default: null, sparse: true, unique: true },
    permissions: { type: [String], default: [] },
    staffType: {
      type: String,
      enum: ["physical", "subject"],
      default: null,
    },
    subjectIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model("User", userSchema);
