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
    permissions: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    studentProfile: {
      phone: { type: String, default: "", trim: true },
      dateOfBirth: { type: Date, default: null },
      gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
      address: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      pincode: { type: String, default: "", trim: true },
      guardianName: { type: String, default: "", trim: true },
      guardianPhone: { type: String, default: "", trim: true },
      enrollmentNumber: { type: String, default: "", trim: true },
      batch: { type: String, default: "", trim: true },
      course: { type: String, default: "", trim: true },
      enrollmentDate: { type: Date, default: null },
      remarks: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model("User", userSchema);
