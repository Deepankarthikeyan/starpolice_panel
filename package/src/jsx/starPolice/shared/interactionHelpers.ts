import type { MessengerContact } from "./InteractionMessenger";

export const GROUP_CONTACT_ID = "group";

export type MessagingContactRecord = {
  id: string;
  contactType: "student" | "staff" | "admin";
  name: string;
  subtitle?: string;
  role: string;
};

export function studentContactId(userId: string) {
  return `student:${userId}`;
}

export function staffContactId(userId: string) {
  return `staff:${userId}`;
}

export function adminContactId(userId: string) {
  return `admin:${userId}`;
}

export function buildGroupContact(options: {
  title: string;
  subtitle: string;
  initials?: string;
}): MessengerContact {
  return {
    id: GROUP_CONTACT_ID,
    kind: "group",
    title: options.title,
    subtitle: options.subtitle,
    initials: options.initials ?? "ALL",
  };
}

export function messagingRecordToContact(record: MessagingContactRecord): MessengerContact {
  if (record.contactType === "student") {
    return {
      id: studentContactId(record.id),
      kind: "private",
      contactType: "student",
      title: record.name,
      subtitle: record.subtitle,
      initials: record.name.slice(0, 2).toUpperCase(),
      section: "Students",
    };
  }

  if (record.contactType === "staff") {
    return {
      id: staffContactId(record.id),
      kind: "private",
      contactType: "staff",
      title: record.name,
      subtitle: record.subtitle,
      initials: record.name.slice(0, 2).toUpperCase(),
      section: "Staff",
    };
  }

  return {
    id: adminContactId(record.id),
    kind: "private",
    contactType: "admin",
    title: record.name,
    subtitle: record.subtitle,
    initials: record.name.slice(0, 2).toUpperCase(),
    section: "Admins",
  };
}

export type MessageQueryParams = {
  channel: "group" | "private";
  studentUserId?: string;
  staffUserId?: string;
  adminUserId?: string;
};

export function messageParamsFromContact(contact: MessengerContact): MessageQueryParams {
  if (contact.kind === "group" || contact.id === GROUP_CONTACT_ID) {
    return { channel: "group" };
  }

  if (contact.contactType === "student" || contact.id.startsWith("student:")) {
    const studentUserId = contact.id.replace(/^student:/, "");
    return { channel: "private", studentUserId };
  }

  if (contact.contactType === "staff" || contact.id.startsWith("staff:")) {
    const staffUserId = contact.id.replace(/^staff:/, "");
    return { channel: "private", staffUserId };
  }

  if (contact.contactType === "admin" || contact.id.startsWith("admin:")) {
    const adminUserId = contact.id.replace(/^admin:/, "");
    return { channel: "private", adminUserId };
  }

  return { channel: "private", studentUserId: contact.id };
}

export function sendParamsFromContact(contact: MessengerContact): MessageQueryParams {
  return messageParamsFromContact(contact);
}
