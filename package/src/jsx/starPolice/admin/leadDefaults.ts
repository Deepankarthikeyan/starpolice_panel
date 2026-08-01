export type LeadStatus = "new" | "follow_up" | "rejected" | "converted";

export type LeadSource =
  | "website"
  | "walk_in"
  | "referral"
  | "social_media"
  | "phone"
  | "other";

export interface LeadRecord {
  id: string;
  leadId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  city: string;
  state: string;
  course: string;
  batch: string;
  previousQualification: string;
  careerGoal: string;
  source: LeadSource;
  status: LeadStatus;
  followUpNotes: string;
  nextFollowUpDate: string;
  rejectionReason: string;
  rejectedAt: string | null;
  convertedStudentOnboardingId: string | null;
  convertedUserId: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormState {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  city: string;
  state: string;
  course: string;
  batch: string;
  previousQualification: string;
  careerGoal: string;
  source: LeadSource;
  followUpNotes: string;
  nextFollowUpDate: string;
}

export const LEAD_STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "follow_up", label: "Follow Up" },
  { value: "rejected", label: "Rejected" },
  { value: "converted", label: "Converted to Student" },
];

export const LEAD_SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: "walk_in", label: "Walk-in" },
  { value: "phone", label: "Phone" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "other", label: "Other" },
];

export function emptyLeadForm(): LeadFormState {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    city: "",
    state: "",
    course: "",
    batch: "",
    previousQualification: "",
    careerGoal: "",
    source: "other",
    followUpNotes: "",
    nextFollowUpDate: "",
  };
}

export function recordToForm(record: LeadRecord): LeadFormState {
  return {
    firstName: record.firstName,
    middleName: record.middleName,
    lastName: record.lastName,
    email: record.email,
    mobileNumber: record.mobileNumber,
    alternateMobileNumber: record.alternateMobileNumber,
    city: record.city,
    state: record.state,
    course: record.course,
    batch: record.batch,
    previousQualification: record.previousQualification,
    careerGoal: record.careerGoal,
    source: record.source,
    followUpNotes: record.followUpNotes,
    nextFollowUpDate: record.nextFollowUpDate,
  };
}

export function fullLeadName(record: Pick<LeadRecord, "firstName" | "middleName" | "lastName">) {
  return [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" ");
}

export function statusBadgeClass(status: LeadStatus) {
  if (status === "follow_up") return "bg-warning text-dark";
  if (status === "rejected") return "bg-danger";
  if (status === "converted") return "bg-success";
  return "bg-secondary";
}

export function statusLabel(status: LeadStatus) {
  return LEAD_STATUS_OPTIONS.find((item) => item.value === status)?.label || status;
}
