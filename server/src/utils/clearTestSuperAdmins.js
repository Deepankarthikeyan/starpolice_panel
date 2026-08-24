import User from "../models/User.js";
import { getMongoStorageKind } from "../config/production.js";

/** Cloud-agent / automated test accounts only — never broad @example.com. */
const TEST_SUPERADMIN_EMAIL_PATTERN = /^testsuper\d+@example\.com$/i;

export function isTestSuperAdminEmail(email) {
  return TEST_SUPERADMIN_EMAIL_PATTERN.test(String(email || "").trim());
}

/**
 * Auto-cleanup runs only for embedded/local MongoDB (cloud agents, dev).
 * Production Atlas storage keeps super admins until explicitly removed.
 */
export function shouldAutoCleanupTestSuperAdmins() {
  const override = process.env.CLEANUP_TEST_SUPERADMINS?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;

  const storage = getMongoStorageKind();
  return storage === "embedded" || storage === "missing";
}

export async function clearTestSuperAdminsIfNeeded() {
  if (!shouldAutoCleanupTestSuperAdmins()) {
    return { cleared: false, deletedCount: 0, skipped: true };
  }

  const superadmins = await User.find({ role: "superadmin" }).select("email");
  const onlyTestAccounts =
    superadmins.length > 0 &&
    superadmins.every((user) => isTestSuperAdminEmail(user.email));

  if (!onlyTestAccounts) {
    return { cleared: false, deletedCount: 0 };
  }

  const result = await User.deleteMany({
    role: "superadmin",
    email: { $regex: TEST_SUPERADMIN_EMAIL_PATTERN },
  });

  if (result.deletedCount > 0) {
    console.log(
      `Removed ${result.deletedCount} cloud-agent test superadmin account(s); signup is open again.`
    );
  }

  return { cleared: true, deletedCount: result.deletedCount };
}
