import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import { defaultPermissionsForRole } from "./permissions.js";

dotenv.config();

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  const password = await bcrypt.hash("superadmin123", 10);
  await User.findOneAndUpdate(
    { email: "superadmin@starpolice.academy" },
    {
      name: "Super Admin",
      email: "superadmin@starpolice.academy",
      password,
      role: "superadmin",
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Seeded superadmin: superadmin@starpolice.academy / superadmin123");

  const studentPassword = await bcrypt.hash("student123", 10);
  const studentPermissions = [
    "student:dashboard",
    "student:materials",
    "student:messages",
    "student:calendar",
    "student:performance",
  ];
  await User.findOneAndUpdate(
    { email: "student@starpolice.academy" },
    {
      name: "Demo Student",
      email: "student@starpolice.academy",
      password: studentPassword,
      role: "student",
      isActive: true,
      permissions: studentPermissions,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Seeded student: student@starpolice.academy / student123");

  const staffPassword = await bcrypt.hash("staff123", 10);
  const staffPermissions = defaultPermissionsForRole("staff");
  await User.findOneAndUpdate(
    { email: "staff@starpolice.academy" },
    {
      name: "Demo Staff",
      email: "staff@starpolice.academy",
      password: staffPassword,
      role: "staff",
      isActive: true,
      permissions: staffPermissions,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Seeded staff: staff@starpolice.academy / staff123");

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
