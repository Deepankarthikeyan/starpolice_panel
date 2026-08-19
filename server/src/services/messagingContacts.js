import User from "../models/User.js";
import StudentOnboarding from "../models/StudentOnboarding.js";

function mapSubjectNames(subjectRefs) {
  if (!subjectRefs?.length) return "";
  return subjectRefs
    .map((ref) => (ref && typeof ref === "object" && ref.name ? ref.name : null))
    .filter(Boolean)
    .join(", ");
}

function mapStudentContact(student) {
  return {
    id: student._id.toString(),
    contactType: "student",
    name: student.name,
    subtitle: student.isActive ? student.email : `${student.email} · Pending login`,
    role: "student",
    isActive: Boolean(student.isActive),
  };
}

function mapStaffContact(member) {
  return {
    id: member._id.toString(),
    contactType: "staff",
    name: member.name,
    subtitle: member.isActive
      ? mapSubjectNames(member.subjectIds) || "Staff member"
      : `${mapSubjectNames(member.subjectIds) || "Staff member"} · Pending login`,
    role: "staff",
    isActive: Boolean(member.isActive),
  };
}

function mapAdminContact(admin) {
  return {
    id: admin._id.toString(),
    contactType: "admin",
    name: admin.name,
    subtitle:
      admin.role === "superadmin"
        ? "Super Admin"
        : admin.isActive
          ? admin.email
          : `${admin.email} · Pending login`,
    role: admin.role,
    isActive: admin.role === "superadmin" ? true : Boolean(admin.isActive),
  };
}

export async function loadStudentContacts() {
  const studentUsers = await User.find({ role: "student" })
    .select("name email isActive")
    .sort({ name: 1 });

  try {
    const linkedOnboardings = await StudentOnboarding.find({ userId: { $ne: null } })
      .select("userId")
      .populate("userId", "name email isActive role");

    const studentMap = new Map();
    for (const student of studentUsers) {
      studentMap.set(student._id.toString(), student);
    }
    for (const record of linkedOnboardings) {
      const linkedUser = record.userId;
      if (linkedUser?.role === "student") {
        studentMap.set(linkedUser._id.toString(), linkedUser);
      }
    }

    return [...studentMap.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(mapStudentContact);
  } catch {
    return studentUsers.map(mapStudentContact);
  }
}

export async function loadAdminContacts() {
  const admins = await User.find({
    role: { $in: ["admin", "superadmin"] },
  })
    .select("name email role isActive")
    .sort({ name: 1 });

  return admins.map(mapAdminContact);
}

export async function loadStaffContacts() {
  const staffMembers = await User.find({ role: "staff" })
    .select("name subjectIds isActive")
    .populate("subjectIds", "name")
    .sort({ name: 1 });

  return staffMembers.map(mapStaffContact);
}

export function resolveMessagePanel(user, reqPanel) {
  if (reqPanel === "student" || reqPanel === "staff" || reqPanel === "admin") {
    return reqPanel;
  }
  if (user.role === "student") return "student";
  if (user.role === "staff") return "staff";
  return "admin";
}

export async function getMessagingContacts(user, panel, scope = "all") {
  if (panel === "student") {
    if (scope === "admin") {
      return loadAdminContacts();
    }
    if (scope === "staff") {
      return loadStaffContacts();
    }
    return [...(await loadAdminContacts()), ...(await loadStaffContacts())];
  }

  if (panel === "admin" || panel === "staff") {
    const contacts = await loadStudentContacts();
    if (panel === "staff" || user.role === "staff") {
      contacts.push(...(await loadAdminContacts()));
    }
    return contacts;
  }

  throw new Error("Unsupported panel for message contacts.");
}
