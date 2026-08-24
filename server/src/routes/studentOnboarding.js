import express from "express";
import bcrypt from "bcryptjs";
import StudentOnboarding from "../models/StudentOnboarding.js";
import User from "../models/User.js";
import { authRequired, adminPanelOnly, attachUser, superAdminOnly } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { defaultPermissionsForRole, sanitizePermissions } from "../permissions.js";
import { sendSetupInvite } from "../services/passwordAuth.js";
import { validateEmailOrThrow } from "../utils/emailValidation.js";
import { generatePlaceholderPassword } from "../utils/authTokens.js";

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
  "residenceType",
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
      const raw = body[key];
      let normalized = raw;
      if (Array.isArray(raw)) {
        normalized = raw.map((entry) => String(entry).trim()).find(Boolean) ?? raw[raw.length - 1];
      }
      data[key] = String(normalized).trim();
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

const RESIDENCE_TYPES = ["Day Scholar", "Hostel"];
const PAYMENT_STATUSES = ["Pending", "Paid", "Partial"];

function validateResidenceType(data, existingRecord = null) {
  const value = data.residenceType || existingRecord?.residenceType || "";
  if (!RESIDENCE_TYPES.includes(value)) {
    return "Day Scholar or Hostel selection is required in course details.";
  }
  return null;
}

function validatePaymentStatus(data, existingRecord = null) {
  const value = data.paymentStatus || existingRecord?.paymentStatus || "";
  if (!PAYMENT_STATUSES.includes(value)) {
    return "Payment status is required (Pending, Paid, or Partial).";
  }
  return null;
}

function parseMaterials(body) {
  if (body.materials === undefined) {
    return undefined;
  }

  let raw = body.materials;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      throw new Error("Invalid materials data.");
    }
  }

  if (!Array.isArray(raw)) {
    throw new Error("Materials must be an array.");
  }

  return raw.map((item) => ({
    materialName: String(item.materialName || "").trim(),
    date: String(item.date || "").trim(),
    given: item.given === true || item.given === "true",
  }));
}

function formatLogValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Given" : "Not Given";
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (entry && typeof entry === "object") {
          const name = entry.materialName || "";
          const date = entry.date || "";
          const given = entry.given ? "Given" : "Not Given";
          return [name, date, given].filter(Boolean).join(" / ");
        }
        return String(entry);
      })
      .filter(Boolean)
      .join("; ");
  }
  return String(value);
}

const TRACKED_LOG_FIELDS = [
  "paymentStatus",
  "registrationFee",
  "courseFee",
  "scholarship",
  "discount",
  "paymentMethod",
  "transactionId",
  "receiptNumber",
  "materials",
];

function buildChangeEntries(existingRecord, data) {
  const changes = [];
  for (const field of TRACKED_LOG_FIELDS) {
    if (data[field] === undefined) continue;
    const oldValue = formatLogValue(existingRecord[field]);
    const newValue = formatLogValue(data[field]);
    if (oldValue !== newValue) {
      changes.push({ field, oldValue, newValue });
    }
  }
  return changes;
}

function appendActivityLog(record, { action, description, performedBy, performedByName, changes = [] }) {
  if (!Array.isArray(record.activityLogs)) {
    record.activityLogs = [];
  }
  record.activityLogs.push({
    action,
    description,
    performedBy,
    performedByName,
    performedAt: new Date(),
    changes,
  });
}

function mapRecord(record) {
  const item = record.toObject ? record.toObject() : record;
  const linkedUser =
    item.userId && typeof item.userId === "object" && item.userId._id ? item.userId : null;

  return {
    id: item._id.toString(),
    studentId: item.studentId,
    userId: linkedUser ? linkedUser._id.toString() : item.userId ? item.userId.toString() : null,
    loginActive: linkedUser ? Boolean(linkedUser.isActive) : false,
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
    residenceType: item.residenceType || "",
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
    materials: (item.materials || []).map((material) => ({
      id: material._id ? material._id.toString() : "",
      materialName: material.materialName || "",
      date: material.date || "",
      given: Boolean(material.given),
    })),
    activityLogs: (item.activityLogs || []).map((log) => ({
      id: log._id ? log._id.toString() : "",
      action: log.action || "updated",
      description: log.description || "",
      performedBy: log.performedBy ? log.performedBy.toString() : null,
      performedByName: log.performedByName || "",
      performedAt: log.performedAt,
      changes: (log.changes || []).map((change) => ({
        field: change.field || "",
        oldValue: change.oldValue || "",
        newValue: change.newValue || "",
      })),
    })),
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

function resolveLoginEmail(record) {
  return (record.loginEmail || record.email || "").trim().toLowerCase();
}

function resolveUsername(record) {
  return (record.username || "").trim().toLowerCase();
}

function parseGrantLogin(value) {
  return value === "true" || value === true;
}

async function assertUniqueUsername(username, excludeUserId = null) {
  if (!username) return;

  const existing = await User.findOne({ username });
  if (existing && existing._id.toString() !== excludeUserId?.toString()) {
    throw new Error("Username is already registered to another account.");
  }
}

async function syncLoginUser({ record, password, permissions, grantLogin, createdBy, clientUrl }) {
  const loginEmail = resolveLoginEmail(record);
  const username = resolveUsername(record);
  const fullName = [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" ");
  const studentPermissions = sanitizePermissions("student", permissions);

  if (!loginEmail && !username) {
    if (grantLogin) {
      throw new Error("Login email is required for student panel access.");
    }
    return null;
  }

  if (!loginEmail && grantLogin) {
    throw new Error("Login email is required for student panel access.");
  }

  if (loginEmail) {
    try {
      validateEmailOrThrow(loginEmail);
    } catch (validationError) {
      throw new Error(validationError.message);
    }
  }

  if (record.userId) {
    const user = await User.findById(record.userId);
    if (!user) {
      record.userId = null;
    } else {
      await assertUniqueUsername(username, user._id);

      user.name = fullName || user.name;
      if (loginEmail) {
        const emailOwner = await User.findOne({ email: loginEmail });
        if (emailOwner && emailOwner._id.toString() !== user._id.toString()) {
          throw new Error("Login email is already registered to another account.");
        }
        user.email = loginEmail;
      }
      if (username) {
        user.username = username;
      } else {
        user.set("username", undefined);
      }
      user.permissions = studentPermissions;

      if (password) {
        user.password = await bcrypt.hash(password, 10);
        user.isActive = Boolean(grantLogin);
      } else {
        user.isActive = Boolean(grantLogin) && user.emailVerified;
        if (grantLogin && !user.emailVerified) {
          await sendSetupInvite(user, "student", clientUrl);
        }
      }

      await user.save();
      return user;
    }
  }

  if (!grantLogin) {
    return null;
  }

  const existingEmail = loginEmail ? await User.findOne({ email: loginEmail }) : null;
  if (existingEmail) {
    throw new Error("Login email is already registered to another account.");
  }

  await assertUniqueUsername(username);

  const placeholder = await bcrypt.hash(generatePlaceholderPassword(), 10);
  const user = await User.create({
    name: fullName || loginEmail || username,
    email: loginEmail,
    ...(username ? { username } : {}),
    password: password ? await bcrypt.hash(password, 10) : placeholder,
    role: "student",
    isActive: password ? true : false,
    emailVerified: password ? true : false,
    permissions: studentPermissions,
    createdBy,
  });

  if (!password) {
    await sendSetupInvite(user, "student", clientUrl);
  }

  record.userId = user._id;
  await record.save();
  return user;
}

async function handleCredentialSync(req, record) {
  const grantLogin = parseGrantLogin(req.body.grantLogin);
  const password = req.body.password?.trim() || "";
  const confirmPassword = req.body.confirmPassword?.trim() || "";
  const hasCredentialInput =
    grantLogin ||
    password ||
    confirmPassword ||
    resolveLoginEmail(record) ||
    resolveUsername(record);

  if (!hasCredentialInput) {
    return;
  }

  if (password || confirmPassword) {
    if (!password || password !== confirmPassword) {
      throw new Error("Password and confirm password must match.");
    }
  }

  await syncLoginUser({
    record,
    password: password || undefined,
    permissions: req.body.studentPermissions
      ? JSON.parse(req.body.studentPermissions)
      : defaultPermissionsForRole("student"),
    grantLogin,
    createdBy: req.user.id,
    clientUrl: req.body.clientUrl,
  });
}

router.get(
  "/",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
  async (_req, res) => {
    try {
      const records = await StudentOnboarding.find()
        .populate("userId", "isActive email username")
        .sort({ createdAt: -1 });
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
  superAdminOnly,
  async (req, res) => {
    try {
      const record = await StudentOnboarding.findById(req.params.id).populate(
        "userId",
        "isActive email username"
      );
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
  superAdminOnly,
  upload.fields(FILE_FIELDS),
  async (req, res) => {
    try {
      const data = parseBodyData(req.body);
      if (!data.firstName || !data.lastName) {
        return res.status(400).json({ message: "First name and last name are required." });
      }
      const residenceError = validateResidenceType(data);
      if (residenceError) {
        return res.status(400).json({ message: residenceError });
      }
      const paymentError = validatePaymentStatus(data);
      if (paymentError) {
        return res.status(400).json({ message: paymentError });
      }

      const materials = parseMaterials(req.body);
      if (materials !== undefined) {
        data.materials = materials;
      }

      const studentId = await generateStudentId();
      const record = await StudentOnboarding.create({
        ...data,
        ...mapFileUrls(req.files),
        studentId,
        createdBy: req.user.id,
        activityLogs: [
          {
            action: "created",
            description: "Student onboarding record created.",
            performedBy: req.user.id,
            performedByName: req.user.name || req.user.email || "Admin",
            performedAt: new Date(),
            changes: [],
          },
        ],
      });

      await handleCredentialSync(req, record);

      const saved = await StudentOnboarding.findById(record._id).populate("userId", "isActive email username");
      res.status(201).json(mapRecord(saved));
    } catch (error) {
      const message = error.message || "Unable to save student onboarding record.";
      const statusCode = /required|must match|already registered/i.test(message) ? 400 : 500;
      res.status(statusCode).json({ message });
    }
  }
);

router.put(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
  upload.fields(FILE_FIELDS),
  async (req, res) => {
    try {
      const record = await StudentOnboarding.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Student onboarding record not found." });
      }

      const data = parseBodyData(req.body);
      const residenceError = validateResidenceType(data, record);
      if (residenceError) {
        return res.status(400).json({ message: residenceError });
      }
      const paymentError = validatePaymentStatus(data, record);
      if (paymentError) {
        return res.status(400).json({ message: paymentError });
      }
      if (!data.residenceType && record.residenceType) {
        data.residenceType = record.residenceType;
      }

      const materials = parseMaterials(req.body);
      if (materials !== undefined) {
        data.materials = materials;
      }

      const changes = buildChangeEntries(record, data);
      Object.assign(record, data, mapFileUrls(req.files));

      if (changes.length > 0) {
        appendActivityLog(record, {
          action: "updated",
          description: "Student onboarding record updated.",
          performedBy: req.user.id,
          performedByName: req.user.name || req.user.email || "Admin",
          changes,
        });
      }

      await record.save();

      await handleCredentialSync(req, record);

      const saved = await StudentOnboarding.findById(record._id).populate("userId", "isActive email username");
      res.json(mapRecord(saved));
    } catch (error) {
      const message = error.message || "Unable to update student onboarding record.";
      const statusCode = /required|must match|already registered/i.test(message) ? 400 : 500;
      res.status(statusCode).json({ message });
    }
  }
);

router.delete(
  "/:id",
  authRequired,
  adminPanelOnly,
  attachUser,
  superAdminOnly,
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
