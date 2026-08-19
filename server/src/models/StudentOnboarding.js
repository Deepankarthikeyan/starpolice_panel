import mongoose from "mongoose";

const studentOnboardingSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: "" },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, default: "" },
    gender: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    nationality: { type: String, default: "" },
    aadhaarOrPassport: { type: String, default: "" },
    profilePhotoUrl: { type: String, default: "" },

    mobileNumber: { type: String, default: "" },
    alternateMobileNumber: { type: String, default: "" },
    email: { type: String, default: "" },
    parentMobileNumber: { type: String, default: "" },
    parentEmail: { type: String, default: "" },

    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    pinCode: { type: String, default: "" },

    fatherName: { type: String, default: "" },
    fatherOccupation: { type: String, default: "" },
    motherName: { type: String, default: "" },
    motherOccupation: { type: String, default: "" },
    guardianName: { type: String, default: "" },
    guardianRelationship: { type: String, default: "" },
    annualFamilyIncome: { type: String, default: "" },

    schoolName: { type: String, default: "" },
    previousQualification: { type: String, default: "" },
    boardUniversity: { type: String, default: "" },
    yearOfPassing: { type: String, default: "" },
    percentageCgpa: { type: String, default: "" },
    mediumOfInstruction: { type: String, default: "" },

    course: { type: String, default: "" },
    batch: { type: String, default: "" },
    branchCampus: { type: String, default: "" },
    section: { type: String, default: "" },
    admissionDate: { type: String, default: "" },
    modeOfLearning: { type: String, default: "" },
    residenceType: {
      type: String,
      enum: ["Day Scholar", "Hostel", ""],
      default: "",
    },
    duration: { type: String, default: "" },
    expectedCompletionDate: { type: String, default: "" },

    aadhaarCardUrl: { type: String, default: "" },
    panCardUrl: { type: String, default: "" },
    passportUrl: { type: String, default: "" },
    drivingLicenceUrl: { type: String, default: "" },
    communityCertificateUrl: { type: String, default: "" },
    transferCertificateUrl: { type: String, default: "" },
    migrationCertificateUrl: { type: String, default: "" },
    birthCertificateUrl: { type: String, default: "" },

    emergencyContactName: { type: String, default: "" },
    emergencyRelationship: { type: String, default: "" },
    emergencyMobile: { type: String, default: "" },
    emergencyAlternateNumber: { type: String, default: "" },

    username: { type: String, default: "" },
    loginEmail: { type: String, default: "" },

    registrationFee: { type: String, default: "" },
    courseFee: { type: String, default: "" },
    scholarship: { type: String, default: "" },
    discount: { type: String, default: "" },
    paymentMethod: { type: String, default: "" },
    paymentStatus: { type: String, default: "" },
    transactionId: { type: String, default: "" },
    receiptNumber: { type: String, default: "" },

    medicalConditions: { type: String, default: "" },
    allergies: { type: String, default: "" },
    disabilities: { type: String, default: "" },
    emergencyNotes: { type: String, default: "" },

    languagesKnown: { type: String, default: "" },
    computerSkills: { type: String, default: "" },
    careerGoal: { type: String, default: "" },
    preferredCommunicationLanguage: { type: String, default: "" },

    termsAccepted: { type: Boolean, default: false },
    privacyAccepted: { type: Boolean, default: false },
    studentSignatureUrl: { type: String, default: "" },
    parentSignatureUrl: { type: String, default: "" },
    declarationDate: { type: String, default: "" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

studentOnboardingSchema.index({ studentId: 1 });
studentOnboardingSchema.index({ createdAt: -1 });
studentOnboardingSchema.index({ loginEmail: 1 });

export default mongoose.model("StudentOnboarding", studentOnboardingSchema);
