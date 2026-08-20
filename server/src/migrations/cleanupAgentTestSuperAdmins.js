import { clearTestSuperAdminsIfNeeded } from "../utils/clearTestSuperAdmins.js";

export async function cleanupAgentTestSuperAdmins() {
  await clearTestSuperAdminsIfNeeded();
}
