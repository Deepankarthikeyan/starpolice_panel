import User from "../models/User.js";
import {
  STAFF_ADMIN_PERMISSION_KEYS,
  defaultPermissionsForRole,
} from "../permissions.js";

const ATTENDANCE_PERMISSION = "admin:attendance";

export async function backfillAttendancePermission() {
  const users = await User.find({ role: { $in: ["staff", "admin"] } });
  let updated = 0;

  for (const user of users) {
    const base =
      user.permissions?.length > 0
        ? [...user.permissions]
        : defaultPermissionsForRole(user.role);

    if (base.includes(ATTENDANCE_PERMISSION)) continue;
    if (!STAFF_ADMIN_PERMISSION_KEYS.includes(ATTENDANCE_PERMISSION)) continue;

    user.permissions = [...base, ATTENDANCE_PERMISSION];
    await user.save();
    updated += 1;
  }

  if (updated > 0) {
    console.log(`Backfilled ${ATTENDANCE_PERMISSION} for ${updated} staff/admin user(s).`);
  }
}
