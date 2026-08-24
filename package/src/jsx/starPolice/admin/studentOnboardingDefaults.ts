export type ResidenceType = "Day Scholar" | "Hostel" | "";

export interface OnboardingMaterial {
  id?: string;
  materialName: string;
  date: string;
  given: boolean;
}

export interface OnboardingActivityLog {
  id?: string;
  action: "created" | "updated";
  description: string;
  performedBy: string | null;
  performedByName: string;
  performedAt?: string;
  changes: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;
}

export interface StudentOnboardingRecord {
  id: string;
  studentId: string;
  userId: string | null;
  loginActive?: boolean;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  nationality: string;
  aadhaarOrPassport: string;
  profilePhotoUrl: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  email: string;
  parentMobileNumber: string;
  parentEmail: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pinCode: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  guardianName: string;
  guardianRelationship: string;
  annualFamilyIncome: string;
  schoolName: string;
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
  modeOfLearning: string;
  residenceType: ResidenceType;
  duration: string;
  expectedCompletionDate: string;
  aadhaarCardUrl: string;
  panCardUrl: string;
  passportUrl: string;
  drivingLicenceUrl: string;
  communityCertificateUrl: string;
  transferCertificateUrl: string;
  migrationCertificateUrl: string;
  birthCertificateUrl: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyMobile: string;
  emergencyAlternateNumber: string;
  username: string;
  loginEmail: string;
  registrationFee: string;
  courseFee: string;
  scholarship: string;
  discount: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  receiptNumber: string;
  materials: OnboardingMaterial[];
  activityLogs?: OnboardingActivityLog[];
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
  studentSignatureUrl: string;
  parentSignatureUrl: string;
  declarationDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export type StudentOnboardingFormState = Omit<
  StudentOnboardingRecord,
  "id" | "userId" | "createdAt" | "updatedAt"
> & {
  password: string;
  confirmPassword: string;
  grantLogin: boolean;
};

export const emptyStudentOnboardingForm = (): StudentOnboardingFormState => ({
  studentId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  nationality: "",
  aadhaarOrPassport: "",
  profilePhotoUrl: "",
  mobileNumber: "",
  alternateMobileNumber: "",
  email: "",
  parentMobileNumber: "",
  parentEmail: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  pinCode: "",
  fatherName: "",
  fatherOccupation: "",
  motherName: "",
  motherOccupation: "",
  guardianName: "",
  guardianRelationship: "",
  annualFamilyIncome: "",
  schoolName: "",
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
  residenceType: "",
  duration: "",
  expectedCompletionDate: "",
  aadhaarCardUrl: "",
  panCardUrl: "",
  passportUrl: "",
  drivingLicenceUrl: "",
  communityCertificateUrl: "",
  transferCertificateUrl: "",
  migrationCertificateUrl: "",
  birthCertificateUrl: "",
  emergencyContactName: "",
  emergencyRelationship: "",
  emergencyMobile: "",
  emergencyAlternateNumber: "",
  username: "",
  loginEmail: "",
  registrationFee: "",
  courseFee: "",
  scholarship: "",
  discount: "",
  paymentMethod: "",
  paymentStatus: "Pending",
  transactionId: "",
  receiptNumber: "",
  materials: [],
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
  studentSignatureUrl: "",
  parentSignatureUrl: "",
  declarationDate: "",
  password: "",
  confirmPassword: "",
  grantLogin: false,
});
