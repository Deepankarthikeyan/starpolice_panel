import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function notifyUsers(userIds, payload) {
  if (!userIds.length) return;

  await Notification.insertMany(
    userIds.map((userId) => ({
      user: userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || "system",
    }))
  );
}

export async function notifyAllStudents(payload) {
  const students = await User.find({ role: "student" }).select("_id");
  await notifyUsers(
    students.map((student) => student._id),
    payload
  );
}

export async function notifyAllAdmins(payload) {
  const admins = await User.find({ role: { $in: ["superadmin", "admin", "staff"] } }).select("_id");
  await notifyUsers(
    admins.map((admin) => admin._id),
    payload
  );
}

export async function notifyAllUsers(payload) {
  const users = await User.find().select("_id");
  await notifyUsers(
    users.map((user) => user._id),
    payload
  );
}
