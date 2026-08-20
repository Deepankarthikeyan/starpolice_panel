import User from "../models/User.js";

function isTestSuperAdminEmail(email) {
  return (
    email.endsWith("@example.com") || /^testsuper\d+@example\.com$/i.test(email)
  );
}

export async function clearTestSuperAdminsIfNeeded() {
  const superadmins = await User.find({ role: "superadmin" }).select("email");
  const onlyTestAccounts =
    superadmins.length > 0 &&
    superadmins.every((user) => isTestSuperAdminEmail(user.email));

  if (!onlyTestAccounts) {
    return { cleared: false, deletedCount: 0 };
  }

  const result = await User.deleteMany({
    role: "superadmin",
    email: { $regex: /@example\.com$/i },
  });

  if (result.deletedCount > 0) {
    console.log(
      `Removed ${result.deletedCount} test superadmin account(s); signup is open again.`
    );
  }

  return { cleared: true, deletedCount: result.deletedCount };
}
