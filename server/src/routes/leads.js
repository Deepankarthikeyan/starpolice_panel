import express from "express";
import Lead, { LEAD_STATUSES } from "../models/Lead.js";
import StudentOnboarding from "../models/StudentOnboarding.js";
import {
  authRequired,
  adminPanelOnly,
  attachUser,
  requirePermission,
} from "../middleware/auth.js";

const router = express.Router();

const leadGuard = [authRequired, adminPanelOnly, attachUser, requirePermission("admin:leads")];

function mapLead(item) {
  return {
    id: item._id.toString(),
    leadId: item.leadId,
    firstName: item.firstName,
    middleName: item.middleName,
    lastName: item.lastName,
    email: item.email,
    mobileNumber: item.mobileNumber,
    alternateMobileNumber: item.alternateMobileNumber,
    city: item.city,
    state: item.state,
    course: item.course,
    batch: item.batch,
    previousQualification: item.previousQualification,
    careerGoal: item.careerGoal,
    source: item.source,
    status: item.status,
    followUpNotes: item.followUpNotes,
    nextFollowUpDate: item.nextFollowUpDate,
    rejectionReason: item.rejectionReason,
    rejectedAt: item.rejectedAt,
    convertedStudentOnboardingId: item.convertedStudentOnboardingId?.toString() || null,
    convertedUserId: item.convertedUserId?.toString() || null,
    convertedAt: item.convertedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function generateLeadId() {
  const year = new Date().getFullYear();
  const prefix = `SPA-LEAD-${year}-`;
  const last = await Lead.findOne({ leadId: { $regex: `^${prefix}` } })
    .sort({ leadId: -1 })
    .select("leadId");

  let sequence = 1;
  if (last?.leadId) {
    const parts = last.leadId.split("-");
    const current = Number.parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(current)) {
      sequence = current + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

async function generateStudentId() {
  const year = new Date().getFullYear();
  const prefix = `SPA-${year}-`;
  const last = await StudentOnboarding.findOne({ studentId: { $regex: `^${prefix}` } })
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

function pickLeadFields(body) {
  return {
    firstName: body.firstName?.trim(),
    middleName: body.middleName?.trim() || "",
    lastName: body.lastName?.trim(),
    email: body.email?.trim().toLowerCase() || "",
    mobileNumber: body.mobileNumber?.trim() || "",
    alternateMobileNumber: body.alternateMobileNumber?.trim() || "",
    city: body.city?.trim() || "",
    state: body.state?.trim() || "",
    course: body.course?.trim() || "",
    batch: body.batch?.trim() || "",
    previousQualification: body.previousQualification?.trim() || "",
    careerGoal: body.careerGoal?.trim() || "",
    source: body.source || "other",
    followUpNotes: body.followUpNotes?.trim() || "",
    nextFollowUpDate: body.nextFollowUpDate?.trim() || "",
  };
}

router.get("/", ...leadGuard, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && LEAD_STATUSES.includes(status)) {
      filter.status = status;
    }
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads.map(mapLead));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", ...leadGuard, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }
    res.json(mapLead(lead));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", ...leadGuard, async (req, res) => {
  try {
    const fields = pickLeadFields(req.body);
    if (!fields.firstName || !fields.lastName) {
      return res.status(400).json({ message: "First name and last name are required." });
    }

    const lead = await Lead.create({
      leadId: await generateLeadId(),
      ...fields,
      status: "new",
      createdBy: req.user.id,
    });

    res.status(201).json(mapLead(lead));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", ...leadGuard, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }
    if (lead.status === "converted") {
      return res.status(400).json({ message: "Converted leads cannot be edited." });
    }

    const fields = pickLeadFields(req.body);
    if (!fields.firstName || !fields.lastName) {
      return res.status(400).json({ message: "First name and last name are required." });
    }

    Object.assign(lead, fields);
    await lead.save();
    res.json(mapLead(lead));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/status", ...leadGuard, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!LEAD_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid lead status." });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    if (lead.status === "converted") {
      return res.status(400).json({ message: "Lead is already converted." });
    }

    if (status === "converted") {
      return res.status(400).json({ message: "Use convert endpoint to convert a lead to student." });
    }

    if (status === "rejected" && lead.status === "rejected") {
      return res.json(mapLead(lead));
    }

    lead.status = status;
    if (status === "rejected") {
      lead.rejectionReason = rejectionReason?.trim() || "";
      lead.rejectedAt = new Date();
    } else {
      lead.rejectionReason = "";
      lead.rejectedAt = null;
    }

    await lead.save();
    res.json(mapLead(lead));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/convert", ...leadGuard, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }

    if (lead.status === "converted") {
      return res.status(400).json({ message: "Lead is already converted." });
    }

    if (lead.status === "rejected") {
      return res.status(400).json({ message: "Rejected leads cannot be converted." });
    }

    const studentId = await generateStudentId();
    const onboarding = await StudentOnboarding.create({
      studentId,
      firstName: lead.firstName,
      middleName: lead.middleName,
      lastName: lead.lastName,
      email: lead.email,
      loginEmail: lead.email,
      mobileNumber: lead.mobileNumber,
      alternateMobileNumber: lead.alternateMobileNumber,
      city: lead.city,
      state: lead.state,
      course: lead.course,
      batch: lead.batch,
      previousQualification: lead.previousQualification,
      careerGoal: lead.careerGoal,
      preferredCommunicationLanguage: "",
      termsAccepted: false,
      privacyAccepted: false,
    });

    lead.status = "converted";
    lead.convertedStudentOnboardingId = onboarding._id;
    lead.convertedAt = new Date();
    await lead.save();

    res.json({
      lead: mapLead(lead),
      studentOnboardingId: onboarding._id.toString(),
      studentId: onboarding.studentId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", ...leadGuard, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found." });
    }
    if (lead.status === "converted") {
      return res.status(400).json({ message: "Converted leads cannot be deleted." });
    }
    await lead.deleteOne();
    res.json({ message: "Lead deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
