import User from "../models/User.js";
import {
  ALL_STUDENT_PERMISSION_KEYS,
  STAFF_ADMIN_PERMISSION_KEYS,
  defaultPermissionsForRole,
} from "../permissions.js";

const ADMIN_QUESTIONS_PERMISSION = "admin:questions";
const STUDENT_QUESTIONS_PERMISSION = "student:questions";

export async function backfillQuestionsPermission() {
  const users = await User.find({ role: { $in: ["staff", "admin", "student"] } });
  let updated = 0;

  for (const user of users) {
    const permission =
      user.role === "student" ? STUDENT_QUESTIONS_PERMISSION : ADMIN_QUESTIONS_PERMISSION;
    const allowedKeys =
      user.role === "student" ? ALL_STUDENT_PERMISSION_KEYS : STAFF_ADMIN_PERMISSION_KEYS;

    if (!allowedKeys.includes(permission)) continue;

    const base =
      user.permissions?.length > 0
        ? [...user.permissions]
        : defaultPermissionsForRole(user.role);

    if (base.includes(permission)) continue;

    user.permissions = [...base, permission];
    await user.save();
    updated += 1;
  }

  if (updated > 0) {
    console.log(`Backfilled ${ADMIN_QUESTIONS_PERMISSION}/${STUDENT_QUESTIONS_PERMISSION} for ${updated} user(s).`);
  }
}
