import User from "../models/User.js";

export async function cleanupAgentTestSuperAdmins() {
  const result = await User.deleteMany({
    role: "superadmin",
    $or: [
      { email: { $regex: /^testsuper\d+@example\.com$/ } },
      { email: { $regex: /@example\.com$/ } },
    ],
  });

  if (result.deletedCount > 0) {
    console.log(`Removed ${result.deletedCount} agent test superadmin account(s).`);
  }
}
