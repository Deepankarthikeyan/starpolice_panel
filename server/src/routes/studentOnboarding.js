import express from "express";
import bcrypt from "bcryptjs";
import StudentOnboarding from "../models/StudentOnboarding.js";
import User from "../models/User.js";
import { authRequired, adminPanelOnly, attachUser, requirePermission } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { defaultPermissionsForRole, sanitizePermissions } from "../permissions.js";

const router = express.Router();

const FILE_FIELDS = [
  { name: "profilePhoto", maxCount: 1 },
  { name: "aadhaarCard", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "drivingLicence", maxCount: 1 },
  { name: "communityCertificate", maxCount: 1 },
  { name: "transferCertificate", maxCount: 1 },
  { name: "migrationCertificate", maxCount: 1 },
  { name: "birthCertificate", maxCount: 1 },
  { name: "studentSignature", maxCount: 1 },
  { name: "parentSignature", maxCount: 1 },
];

const FILE_URL_MAP = {
  profilePhoto: "profilePhotoUrl",
  aadhaarCard: "aadhaarCardUrl",
  panCard: "panCardUrl",
  passport: "passportUrl",
  drivingLicence: "drivingLicenceUrl",
  communityCertificate: "communityCertificateUrl",
  transferCertificate: "transferCertificateUrl",
  migrationCertificate: "migrationCertificateUrl",
  birthCertificate: "birthCertificateUrl",
  studentSignature: "studentSignatureUrl",
  parentSignature: "parentSignatureUrl",
};

const TEXT_FIELDS = [
  "firstName",
  "middleName",
  "lastName",
  "dateOfBirth",
  "gender",
  "bloodGroup",
  "nationality",
  "aadhaarOrPassport",
  "mobileNumber",
  "alternateMobileNumber",
  "email",
  "parentMobileNumber",
  "parentEmail",
  "addressLine1",
  "addressLine2",
  "city",
  "district",
  "state",
  "country",
  "pinCode",
  "fatherName",
  "fatherOccupation",
  "motherName",
  "motherOccupation",
  "guardianName",
  "guardianRelationship",
  "annualFamilyIncome",
  "schoolName",
  "previousQualification",
  "boardUniversity",
  "yearOfPassing",
  "percentageCgpa",
  "mediumOfInstruction",
  "course",
  "batch",
  "branchCampus",
  "section",
  "admissionDate",
  "modeOfLearning",
  "duration",
  "expectedCompletionDate",
  "emergencyContactName",
  "emergencyRelationship",
  "emergencyMobile",
  "emergencyAlternateNumber",
  "username",
  "loginEmail",
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
  "declarationDate",
];

function mapFileUrls(files = {}) {
  const urls = {};
  for (const [field, urlKey] of Object.entries(FILE_URL_MAP)) {
    const file = files[field]?.[0];
    if (file) {
      urls[urlKey] = `/uploads/${file.filename}`;
    }
  }
  return urls;
}

function parseBodyData(body) {
  const data = {};
  for (const key of TEXT_FIELDS) {
    if (body[key] !== undefined) {
      data[key] = String(body[key]).trim();
    }
  }
  if (body.termsAccepted !== undefined) {
    data.termsAccepted = body.termsAccepted === "true" || body.termsAccepted === true;
  }
  if (body.privacyAccepted !== undefined) {
    data.privacyAccepted = body.privacyAccepted === "true" || body.privacyAccepted === true;
  }
  return data;
}

function mapRecord(record) {
  const item = record.toObject ? record.toObject() : record;
  return {
    id: item._id.toString(),
    studentId: item.studentId,
    userId: item.userId ? item.userId.toString() : null,
    firstName: item.firstName,
    middleName: item.middleName,
    lastName: item.lastName,
    dateOfBirth: item.dateOfBirth,
    gender: item.gender,
    bloodGroup: item.bloodGroup,
    nationality: item.nationality,
    aadhaarOrPassport: item.aadhaarOrPassport,
    profilePhotoUrl: item.profilePhotoUrl,
    mobileNumber: item.mobileNumber,
    alternateMobileNumber: item.alternateMobileNumber,
    email: item.email,
    parentMobileNumber: item.parentMobileNumber,
    parentEmail: item.parentEmail,
    addressLine1: item.addressLine1,
    addressLine2: item.addressLine2,
    city: item.city,
    district: item.district,
    state: item.state,
    country: item.country,
    pinCode: item.pinCode,
    fatherName: item.fatherName,
    fatherOccupation: item.fatherOccupation,
    motherName: item.motherName,
    motherOccupation: item.motherOccupation,
    guardianName: item.guardianName,
    guardianRelationship: item.guardianRelationship,
    annualFamilyIncome: item.annualFamilyIncome,
    schoolName: item.schoolName,
    previousQualification: item.previousQualification,
    boardUniversity: item.boardUniversity,
    yearOfPassing: item.yearOfPassing,
    percentageCgpa: item.percentageCgpa,
    mediumOfInstruction: item.mediumOfInstruction,
    course: item.course,
    batch: item.batch,
    branchCampus: item.branchCampus,
    section: item.section,
    admissionDate: item.admissionDate,
    modeOfLearning: item.modeOfLearning,
    duration: item.duration,
    expectedCompletionDate: item.expectedCompletionDate,
    aadhaarCardUrl: item.aadhaarCardUrl,
    panCardUrl: item.panCardUrl,
    passportUrl: item.passportUrl,
    drivingLicenceUrl: item.drivingLicenceUrl,
    communityCertificateUrl: item.communityCertificateUrl,
    transferCertificateUrl: item.transferCertificateUrl,
    migrationCertificateUrl: item.migrationCertificateUrl,
    birthCertificateUrl: item.birthCertificateUrl,
    emergencyContactName: item.emergencyContactName,
    emergencyRelationship: item.emergencyRelationship,
    emergencyMobile: item.emergencyMobile,
    emergencyAlternateNumber: item.emergencyAlternateNumber,
    username: item.username,
    loginEmail: item.loginEmail,
    registrationFee: item.registrationFee,
    courseFee: item.courseFee,
    scholarship: item.scholarship,
    discount: item.discount,
    paymentMethod: item.paymentMethod,
    paymentStatus: item.paymentStatus,
    transactionId: item.transactionId,
    receiptNumber: item.receiptNumber,
    medicalConditions: item.medicalConditions,
    allergies: item.allergies,
    disabilities: item.disabilities,
    emergencyNotes: item.emergencyNotes,
    languagesKnown: item.languagesKnown,
    computerSkills: item.computerSkills,
    careerGoal: item.careerGoal,
    preferredCommunicationLanguage: item.preferredCommunicationLanguage,
    termsAccepted: item.termsAccepted,
    privacyAccepted: item.privacyAccepted,
    studentSignatureUrl: item.studentSignatureUrl,
    parentSignatureUrl: item.parentSignatureUrl,
    declarationDate: item.declarationDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function generateStudentId() {
  const year = new Date().getFullYear();
  const prefix = `SPA-${year}-`;
  const last = await StudentOnboarding.findOne({
    studentId: { $regex: `^${prefix}` },
  })
    .sort({ studentId: -1 })
    .select("studentId");

  let sequence = 1;
  if (last?.studentId) {
    const parts = last.studentId.split("-");
    const current = Number.parseInt(parts[2], 10);
    if (!Number.isNaN(current)) {
      sequence = current + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

async function syncLoginUser({ record, password, permissions, grantLogin, createdBy }) {
  const loginEmail = record.loginEmail?.trim().toLowerCase();
  if (!loginEmail || !password) {
    return null;
  }

  const fullName = [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" ");
  const hashed = await bcrypt.hash(password, 10);
  const studentPermissions = sanitizePermissions("student", permissions);

  if (record.userId) {
    const user = await User.findById(record.userId);
    if (!user) {
      record.userId = null;
    } else {
      user.name = fullName || user.name;
      user.email = loginEmail;
      user.password = hashed;
      user.permissions = studentPermissions;
      if (grantLogin) {
        user.isActive = true;
      }
      await user.save();
      return user;
    }
  }

  const existing = await User.findOne({ email: loginEmail });
  if (existing && existing._id.toString() !== record.userId?.toString()) {
    throw new Error("Login email is already registered to another account.");
  }

  const user = await User.create({
    name: fullName || loginEmail,
    email: loginEmail,
    password: hashed,
    role: "student",
    isActive: Boolean(grantLogin),
    permissions: studentPermissions,
    createdBy,
  });

  record.userId = user._id;
  await record.save();
  return user;
}

router.get(
  "/",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:onboarding"),
  async (_req, res) => {
    try {
      const records = await StudentOnboarding.find().sort({ createdAt: -1 });
      res.json(records.map(mapRecord));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:onboarding"),
  async (req, res) => {
    try {
      const record = await StudentOnboarding.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Student onboarding record not found." });
      }
      res.json(mapRecord(record));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:onboarding"),
  upload.fields(FILE_FIELDS),
  async (req, res) => {
    try {
      const data = parseBodyData(req.body);
      if (!data.firstName || !data.lastName) {
        return res.status(400).json({ message: "First name and last name are required." });
      }

      const studentId = await generateStudentId();
      const record = await StudentOnboarding.create({
        ...data,
        ...mapFileUrls(req.files),
        studentId,
        createdBy: req.user.id,
      });

      const password = req.body.password?.trim();
      const confirmPassword = req.body.confirmPassword?.trim();
      if (password || confirmPassword) {
        if (!password || password !== confirmPassword) {
          return res.status(400).json({ message: "Password and confirm password must match." });
        }
        await syncLoginUser({
          record,
          password,
          permissions: req.body.studentPermissions
            ? JSON.parse(req.body.studentPermissions)
            : defaultPermissionsForRole("student"),
          grantLogin: req.body.grantLogin === "true" || req.body.grantLogin === true,
          createdBy: req.user.id,
        });
      }

      res.status(201).json(mapRecord(record));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.put(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:onboarding"),
  upload.fields(FILE_FIELDS),
  async (req, res) => {
    try {
      const record = await StudentOnboarding.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Student onboarding record not found." });
      }

      const data = parseBodyData(req.body);
      Object.assign(record, data, mapFileUrls(req.files));
      await record.save();

      const password = req.body.password?.trim();
      const confirmPassword = req.body.confirmPassword?.trim();
      if (password || confirmPassword) {
        if (!password || password !== confirmPassword) {
          return res.status(400).json({ message: "Password and confirm password must match." });
        }
        await syncLoginUser({
          record,
          password,
          permissions: req.body.studentPermissions
            ? JSON.parse(req.body.studentPermissions)
            : defaultPermissionsForRole("student"),
          grantLogin: req.body.grantLogin === "true" || req.body.grantLogin === true,
          createdBy: req.user.id,
        });
      } else if (req.body.grantLogin === "true" || req.body.grantLogin === true) {
        if (record.userId) {
          await User.findByIdAndUpdate(record.userId, { isActive: true });
        }
      }

      res.json(mapRecord(record));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission("admin:onboarding"),
  async (req, res) => {
    try {
      const record = await StudentOnboarding.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Student onboarding record not found." });
      }

      if (record.userId) {
        await User.findByIdAndDelete(record.userId);
      }

      await record.deleteOne();
      res.json({ message: "Student onboarding record deleted." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
