export interface StudentDocuments {
  aadhaarCard: string;
  panCard: string;
  passport: string;
  drivingLicence: string;
  communityCertificate: string;
  transferCertificate: string;
  migrationCertificate: string;
  birthCertificate: string;
}

export interface StudentProfile {
  studentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "" | "male" | "female" | "other";
  bloodGroup: string;
  nationality: string;
  aadhaarPassportNumber: string;
  profilePhoto: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  parentGuardianMobile: string;
  parentGuardianEmail: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  guardianName: string;
  guardianRelationship: string;
  annualFamilyIncome: string;
  schoolCollegeName: string;
  previousQualification: string;
  boardUniversity: string;
  yearOfPassing: string;
  percentageCgpa: string;
  mediumOfInstruction: string;
  course: string;
  batch: string;
  branchCampus: string;
  section: string;
  admissionDate: string;
  modeOfLearning: "" | "online" | "offline" | "hybrid";
  duration: string;
  expectedCompletionDate: string;
  documents: StudentDocuments;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactMobile: string;
  emergencyContactAlternate: string;
  username: string;
  registrationFee: string;
  courseFee: string;
  scholarship: string;
  discount: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  receiptNumber: string;
  medicalConditions: string;
  allergies: string;
  disabilities: string;
  emergencyNotes: string;
  languagesKnown: string;
  computerSkills: string;
  careerGoal: string;
  preferredCommunicationLanguage: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  studentSignature: string;
  parentSignature: string;
  declarationDate: string;
}

export type StudentProfileInput = StudentProfile;
export type DocumentField = keyof StudentDocuments | "profilePhoto";

export const DOCUMENT_FIELDS: Array<{ key: DocumentField; label: string }> = [
  { key: "profilePhoto", label: "Profile Photo" },
  { key: "aadhaarCard", label: "Aadhaar Card" },
  { key: "panCard", label: "PAN Card (Optional)" },
  { key: "passport", label: "Passport (Optional)" },
  { key: "drivingLicence", label: "Driving Licence (Optional)" },
  { key: "communityCertificate", label: "Community Certificate" },
  { key: "transferCertificate", label: "Transfer Certificate (TC)" },
  { key: "migrationCertificate", label: "Migration Certificate" },
  { key: "birthCertificate", label: "Birth Certificate" },
];

export function emptyDocuments(): StudentDocuments {
  return {
    aadhaarCard: "",
    panCard: "",
    passport: "",
    drivingLicence: "",
    communityCertificate: "",
    transferCertificate: "",
    migrationCertificate: "",
    birthCertificate: "",
  };
}

export function emptyStudentProfile(): StudentProfile {
  return {
    studentId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    nationality: "",
    aadhaarPassportNumber: "",
    profilePhoto: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    parentGuardianMobile: "",
    parentGuardianEmail: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    state: "",
    country: "",
    pincode: "",
    fatherName: "",
    fatherOccupation: "",
    motherName: "",
    motherOccupation: "",
    guardianName: "",
    guardianRelationship: "",
    annualFamilyIncome: "",
    schoolCollegeName: "",
    previousQualification: "",
    boardUniversity: "",
    yearOfPassing: "",
    percentageCgpa: "",
    mediumOfInstruction: "",
    course: "",
    batch: "",
    branchCampus: "",
    section: "",
    admissionDate: "",
    modeOfLearning: "",
    duration: "",
    expectedCompletionDate: "",
    documents: emptyDocuments(),
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactMobile: "",
    emergencyContactAlternate: "",
    username: "",
    registrationFee: "",
    courseFee: "",
    scholarship: "",
    discount: "",
    paymentMethod: "",
    paymentStatus: "",
    transactionId: "",
    receiptNumber: "",
    medicalConditions: "",
    allergies: "",
    disabilities: "",
    emergencyNotes: "",
    languagesKnown: "",
    computerSkills: "",
    careerGoal: "",
    preferredCommunicationLanguage: "",
    termsAccepted: false,
    privacyAccepted: false,
    studentSignature: "",
    parentSignature: "",
    declarationDate: "",
  };
}

export function buildFullName(profile: Pick<StudentProfile, "firstName" | "middleName" | "lastName">) {
  return [profile.firstName, profile.middleName, profile.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

export function getDocumentUrl(profile: StudentProfile, field: DocumentField) {
  if (field === "profilePhoto") {
    return profile.profilePhoto;
  }
  return profile.documents[field];
}
