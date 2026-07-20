import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

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

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
