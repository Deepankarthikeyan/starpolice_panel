import User from "../models/User.js";

const LEADS_PERMISSION = "admin:leads";

export async function stripLeadsFromStaff() {
  const result = await User.updateMany(
    { role: "staff", permissions: LEADS_PERMISSION },
    { $pull: { permissions: LEADS_PERMISSION } }
  );

  if (result.modifiedCount > 0) {
    console.log(`Removed ${LEADS_PERMISSION} from ${result.modifiedCount} staff user(s).`);
  }
}
