const STRING_FIELDS = [
  "firstName",
  "middleName",
  "lastName",
  "gender",
  "bloodGroup",
  "nationality",
  "aadhaarPassportNumber",
  "profilePhoto",
  "mobileNumber",
  "alternateMobileNumber",
  "parentGuardianMobile",
  "parentGuardianEmail",
  "addressLine1",
  "addressLine2",
  "city",
  "district",
  "state",
  "country",
  "pincode",
  "fatherName",
  "fatherOccupation",
  "motherName",
  "motherOccupation",
  "guardianName",
  "guardianRelationship",
  "annualFamilyIncome",
  "schoolCollegeName",
  "previousQualification",
  "boardUniversity",
  "yearOfPassing",
  "percentageCgpa",
  "mediumOfInstruction",
  "course",
  "batch",
  "branchCampus",
  "section",
  "modeOfLearning",
  "duration",
  "username",
  "registrationFee",
  "courseFee",
  "scholarship",
  "discount",
  "paymentMethod",
  "paymentStatus",
  "transactionId",
  "receiptNumber",
  "medicalConditions",
  "allergies",
  "disabilities",
  "emergencyNotes",
  "languagesKnown",
  "computerSkills",
  "careerGoal",
  "preferredCommunicationLanguage",
  "studentSignature",
  "parentSignature",
];

const DATE_FIELDS = [
  "dateOfBirth",
  "admissionDate",
  "expectedCompletionDate",
  "declarationDate",
];

const BOOLEAN_FIELDS = ["termsAccepted", "privacyAccepted"];

const DOCUMENT_FIELDS = [
  "aadhaarCard",
  "panCard",
  "passport",
  "drivingLicence",
  "communityCertificate",
  "transferCertificate",
  "migrationCertificate",
  "birthCertificate",
];

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function buildFullName(profile = {}) {
  return [profile.firstName, profile.middleName, profile.lastName]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");
}

export async function generateStudentId() {
  const User = (await import("../models/User.js")).default;
  const year = new Date().getFullYear();
  const prefix = `SPA-${year}-`;

  const latest = await User.findOne({
    role: "student",
    "studentProfile.studentId": new RegExp(`^${prefix}`),
  })
    .sort({ "studentProfile.studentId": -1 })
    .select("studentProfile.studentId");

  let next = 1;
  if (latest?.studentProfile?.studentId) {
    const current = Number(latest.studentProfile.studentId.split("-").pop());
    if (!Number.isNaN(current)) {
      next = current + 1;
    }
  }

  return `${prefix}${String(next).padStart(4, "0")}`;
}

export function mapStudentProfile(profile = {}) {
  const documents = profile.documents || {};

  return {
    studentId: profile.studentId || "",
    firstName: profile.firstName || "",
    middleName: profile.middleName || "",
    lastName: profile.lastName || "",
    dateOfBirth: formatDate(profile.dateOfBirth),
    gender: profile.gender || "",
    bloodGroup: profile.bloodGroup || "",
    nationality: profile.nationality || "",
    aadhaarPassportNumber: profile.aadhaarPassportNumber || "",
    profilePhoto: profile.profilePhoto || "",
    mobileNumber: profile.mobileNumber || "",
    alternateMobileNumber: profile.alternateMobileNumber || "",
    parentGuardianMobile: profile.parentGuardianMobile || "",
    parentGuardianEmail: profile.parentGuardianEmail || "",
    addressLine1: profile.addressLine1 || "",
    addressLine2: profile.addressLine2 || "",
    city: profile.city || "",
    district: profile.district || "",
    state: profile.state || "",
    country: profile.country || "",
    pincode: profile.pincode || "",
    fatherName: profile.fatherName || "",
    fatherOccupation: profile.fatherOccupation || "",
    motherName: profile.motherName || "",
    motherOccupation: profile.motherOccupation || "",
    guardianName: profile.guardianName || "",
    guardianRelationship: profile.guardianRelationship || "",
    annualFamilyIncome: profile.annualFamilyIncome || "",
    schoolCollegeName: profile.schoolCollegeName || "",
    previousQualification: profile.previousQualification || "",
    boardUniversity: profile.boardUniversity || "",
    yearOfPassing: profile.yearOfPassing || "",
    percentageCgpa: profile.percentageCgpa || "",
    mediumOfInstruction: profile.mediumOfInstruction || "",
    course: profile.course || "",
    batch: profile.batch || "",
    branchCampus: profile.branchCampus || "",
    section: profile.section || "",
    admissionDate: formatDate(profile.admissionDate),
    modeOfLearning: profile.modeOfLearning || "",
    duration: profile.duration || "",
    expectedCompletionDate: formatDate(profile.expectedCompletionDate),
    documents: {
      aadhaarCard: documents.aadhaarCard || "",
      panCard: documents.panCard || "",
      passport: documents.passport || "",
      drivingLicence: documents.drivingLicence || "",
      communityCertificate: documents.communityCertificate || "",
      transferCertificate: documents.transferCertificate || "",
      migrationCertificate: documents.migrationCertificate || "",
      birthCertificate: documents.birthCertificate || "",
    },
    emergencyContactName: profile.emergencyContactName || "",
    emergencyContactRelationship: profile.emergencyContactRelationship || "",
    emergencyContactMobile: profile.emergencyContactMobile || "",
    emergencyContactAlternate: profile.emergencyContactAlternate || "",
    username: profile.username || "",
    registrationFee: profile.registrationFee || "",
    courseFee: profile.courseFee || "",
    scholarship: profile.scholarship || "",
    discount: profile.discount || "",
    paymentMethod: profile.paymentMethod || "",
    paymentStatus: profile.paymentStatus || "",
    transactionId: profile.transactionId || "",
    receiptNumber: profile.receiptNumber || "",
    medicalConditions: profile.medicalConditions || "",
    allergies: profile.allergies || "",
    disabilities: profile.disabilities || "",
    emergencyNotes: profile.emergencyNotes || "",
    languagesKnown: profile.languagesKnown || "",
    computerSkills: profile.computerSkills || "",
    careerGoal: profile.careerGoal || "",
    preferredCommunicationLanguage: profile.preferredCommunicationLanguage || "",
    termsAccepted: Boolean(profile.termsAccepted),
    privacyAccepted: Boolean(profile.privacyAccepted),
    studentSignature: profile.studentSignature || "",
    parentSignature: profile.parentSignature || "",
    declarationDate: formatDate(profile.declarationDate),
  };
}

export function applyStudentProfile(user, profile = {}) {
  if (!user.studentProfile) {
    user.studentProfile = {};
  }

  STRING_FIELDS.forEach((field) => {
    if (profile[field] !== undefined) {
      user.studentProfile[field] = String(profile[field] || "").trim();
    }
  });

  DATE_FIELDS.forEach((field) => {
    if (profile[field] !== undefined) {
      user.studentProfile[field] = profile[field] ? new Date(profile[field]) : null;
    }
  });

  BOOLEAN_FIELDS.forEach((field) => {
    if (profile[field] !== undefined) {
      user.studentProfile[field] = Boolean(profile[field]);
    }
  });

  if (profile.documents) {
    if (!user.studentProfile.documents) {
      user.studentProfile.documents = {};
    }
    DOCUMENT_FIELDS.forEach((field) => {
      if (profile.documents[field] !== undefined) {
        user.studentProfile.documents[field] = String(profile.documents[field] || "").trim();
      }
    });
  }
}

export function setStudentDocument(user, field, fileUrl) {
  if (!user.studentProfile) {
    user.studentProfile = {};
  }
  if (!user.studentProfile.documents) {
    user.studentProfile.documents = {};
  }

  if (field === "profilePhoto") {
    user.studentProfile.profilePhoto = fileUrl;
    return;
  }

  if (DOCUMENT_FIELDS.includes(field)) {
    user.studentProfile.documents[field] = fileUrl;
  }
}
