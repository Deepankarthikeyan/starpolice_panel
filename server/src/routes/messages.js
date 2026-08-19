import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";
import StudentOnboarding from "../models/StudentOnboarding.js";
import { authRequired, attachUser } from "../middleware/auth.js";
import { hasAnyPermission } from "../permissions.js";
import { notifyAllAdmins, notifyAllStudents, notifyUsers } from "../utils/notifications.js";

const router = express.Router();

function mapMessage(item) {
  return {
    id: item._id.toString(),
    senderRole: item.senderRole,
    senderName: item.senderName,
    senderEmail: item.senderEmail,
    message: item.message,
    channel: item.channel || "group",
    threadStudentId: item.threadStudentId ? item.threadStudentId.toString() : null,
    threadStaffId: item.threadStaffId ? item.threadStaffId.toString() : null,
    threadAdminId: item.threadAdminId ? item.threadAdminId.toString() : null,
    createdAt: item.createdAt,
  };
}

function resolveMessagePanel(user, reqPanel) {
  if (reqPanel === "student" || reqPanel === "staff" || reqPanel === "admin") {
    return reqPanel;
  }
  if (user.role === "student") return "student";
  if (user.role === "staff") return "staff";
  return "admin";
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

function mapSubjectNames(subjectRefs) {
  if (!subjectRefs?.length) return "";
  return subjectRefs
    .map((ref) => (ref && typeof ref === "object" && ref.name ? ref.name : null))
    .filter(Boolean)
    .join(", ");
}

function canViewMessages(user) {
  return (
    user.role === "superadmin" ||
    hasAnyPermission(user, ["admin:messages", "student:messages", "student:dashboard"])
  );
}

function canSendMessages(user, panel) {
  if (user.role === "superadmin") return true;
  if ((panel === "admin" || panel === "staff") && hasAnyPermission(user, ["admin:messages"])) {
    return true;
  }
  if (panel === "student" && hasAnyPermission(user, ["student:messages"])) return true;
  return false;
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

function noStaffThreadFilter() {
  return {
    $or: [{ threadStaffId: null }, { threadStaffId: { $exists: false } }],
  };
}

function isAdminSideRole(role) {
  return role === "admin" || role === "superadmin";
}

function buildPrivateFilter(user, { studentUserId, staffUserId, adminUserId }) {
  if (adminUserId && user.role === "staff") {
    return {
      channel: "private",
      threadStaffId: user._id,
      threadAdminId: adminUserId,
    };
  }

  if (adminUserId && user.role === "student") {
    return {
      channel: "private",
      threadStudentId: user._id,
      threadAdminId: adminUserId,
      ...noStaffThreadFilter(),
    };
  }

  if (staffUserId && user.role === "student") {
    return {
      channel: "private",
      threadStudentId: user._id,
      threadStaffId: staffUserId,
    };
  }

  if (studentUserId) {
    if (user.role === "staff") {
      return {
        channel: "private",
        threadStudentId: studentUserId,
        threadStaffId: user._id,
      };
    }

    if (isAdminSideRole(user.role)) {
      return {
        channel: "private",
        threadStudentId: studentUserId,
        $or: [
          { threadAdminId: null, threadStaffId: null },
          { threadAdminId: { $exists: false }, threadStaffId: { $exists: false } },
          { threadAdminId: user._id },
        ],
      };
    }
  }

  return null;
}

async function loadStudentContacts() {
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

async function loadAdminContacts() {
  const admins = await User.find({
    role: { $in: ["admin", "superadmin"] },
  })
    .select("name email role isActive")
    .sort({ name: 1 });

  return admins.map(mapAdminContact);
}

async function loadStaffContacts() {
  const staffMembers = await User.find({ role: "staff" })
    .select("name subjectIds isActive")
    .populate("subjectIds", "name")
    .sort({ name: 1 });

  return staffMembers.map(mapStaffContact);
}

router.get("/contacts", authRequired, attachUser, async (req, res) => {
  try {
    const user = req.currentUser;
    const panel = resolveMessagePanel(user, req.user.panel);

    if (!canViewMessages(user)) {
      return res.status(403).json({ message: "You do not have permission to view message contacts." });
    }

    if (panel === "student") {
      const scope = req.query.scope === "admin" || req.query.scope === "staff" ? req.query.scope : "all";

      if (scope === "admin") {
        return res.json(await loadAdminContacts());
      }

      if (scope === "staff") {
        return res.json(await loadStaffContacts());
      }

      return res.json([...(await loadAdminContacts()), ...(await loadStaffContacts())]);
    }

    if (panel === "admin" || panel === "staff") {
      const contacts = await loadStudentContacts();

      if (panel === "staff" || user.role === "staff") {
        contacts.push(...(await loadAdminContacts()));
      }

      return res.json(contacts);
    }

    return res.status(400).json({ message: "Unsupported panel for message contacts." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authRequired, attachUser, async (req, res) => {
  try {
    const user = req.currentUser;
    if (!canViewMessages(user)) {
      return res.status(403).json({ message: "You do not have permission to view messages." });
    }

    const channel = req.query.channel === "private" ? "private" : "group";
    if (channel === "group") {
      const messages = await Message.find({ channel: "group" }).sort({ createdAt: 1 }).limit(200);
      return res.json(messages.map(mapMessage));
    }

    const { studentUserId, staffUserId, adminUserId } = req.query;
    const filter = buildPrivateFilter(user, { studentUserId, staffUserId, adminUserId });

    if (!filter) {
      return res.status(400).json({
        message: "Provide studentUserId, staffUserId, or adminUserId for private messages.",
      });
    }

    if (filter.threadStudentId) {
      const student = await User.findOne({ _id: filter.threadStudentId, role: "student" }).select("_id");
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
    }

    if (filter.threadStaffId) {
      const staff = await User.findOne({ _id: filter.threadStaffId, role: "staff" }).select("_id");
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found." });
      }
    }

    if (filter.threadAdminId) {
      const admin = await User.findOne({
        _id: filter.threadAdminId,
        role: { $in: ["admin", "superadmin"] },
      }).select("_id");
      if (!admin) {
        return res.status(404).json({ message: "Admin not found." });
      }
    }

    const messages = await Message.find(filter).sort({ createdAt: 1 }).limit(200);
    res.json(messages.map(mapMessage));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, attachUser, async (req, res) => {
  try {
    const user = req.currentUser;
    const panel = req.user.panel;
    if (!canSendMessages(user, panel)) {
      return res.status(403).json({ message: "You do not have permission to send messages." });
    }

    const { message, channel = "group", studentUserId, staffUserId, adminUserId } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const resolvedChannel = channel === "private" ? "private" : "group";
    let threadStudentId = null;
    let threadStaffId = null;
    let threadAdminId = null;

    if (resolvedChannel === "private") {
      if (user.role === "student") {
        if (adminUserId) {
          const admin = await User.findOne({
            _id: adminUserId,
            role: { $in: ["admin", "superadmin"] },
          }).select("_id");
          if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
          }
          threadStudentId = user._id;
          threadAdminId = admin._id;
        } else if (staffUserId) {
          const staff = await User.findOne({ _id: staffUserId, role: "staff" }).select("_id");
          if (!staff) {
            return res.status(404).json({ message: "Staff member not found." });
          }
          threadStudentId = user._id;
          threadStaffId = staff._id;
        } else {
          return res.status(400).json({ message: "staffUserId or adminUserId is required for private messages." });
        }
      } else if (adminUserId && user.role === "staff") {
        const admin = await User.findOne({
          _id: adminUserId,
          role: { $in: ["admin", "superadmin"] },
        }).select("_id");
        if (!admin) {
          return res.status(404).json({ message: "Admin not found." });
        }
        threadStaffId = user._id;
        threadAdminId = admin._id;
      } else if (studentUserId && (isAdminSideRole(user.role) || user.role === "staff")) {
        const student = await User.findOne({ _id: studentUserId, role: "student" }).select("_id");
        if (!student) {
          return res.status(404).json({ message: "Student not found." });
        }
        threadStudentId = student._id;
        if (user.role === "staff") {
          threadStaffId = user._id;
        }
      } else {
        return res.status(400).json({ message: "studentUserId, staffUserId, or adminUserId is required." });
      }
    }

    const entry = await Message.create({
      sender: req.user.id,
      senderRole: req.user.role,
      senderName: req.user.name,
      senderEmail: req.user.email,
      message: message.trim(),
      channel: resolvedChannel,
      threadStudentId,
      threadStaffId,
      threadAdminId,
    });

    if (resolvedChannel === "group") {
      await notifyAllStudents({
        title: "Group Message",
        message: message.trim().slice(0, 80),
        type: "message",
      });
    } else if (threadStaffId && threadAdminId) {
      await notifyUsers([threadAdminId], {
        title: "Staff Message",
        message: `${req.user.name}: ${message.trim().slice(0, 80)}`,
        type: "message",
      });
    } else if (threadStaffId && threadStudentId) {
      if (user.role === "student") {
        await notifyUsers([threadStaffId], {
          title: "New Student Message",
          message: `${req.user.name}: ${message.trim().slice(0, 80)}`,
          type: "message",
        });
      } else {
        await notifyUsers([threadStudentId], {
          title: "Private Message",
          message: message.trim().slice(0, 80),
          type: "message",
        });
      }
    } else if (threadAdminId && threadStudentId) {
      await notifyUsers([threadAdminId], {
        title: "New Student Message",
        message: `${req.user.name}: ${message.trim().slice(0, 80)}`,
        type: "message",
      });
    } else if (threadStudentId) {
      await notifyUsers([threadStudentId], {
        title: "Private Message",
        message: message.trim().slice(0, 80),
        type: "message",
      });
    }

    res.status(201).json(mapMessage(entry));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
