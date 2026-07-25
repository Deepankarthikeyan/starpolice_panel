import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  const users = [
    {
      name: "Super Admin",
      email: "superadmin@starpolice.academy",
      password: "superadmin123",
      role: "superadmin",
      isActive: true,
    },
    {
      name: "Admin",
      email: "admin@starpolice.academy",
      password: "admin123",
      role: "admin",
      isActive: true,
    },
    {
      name: "Student",
      email: "student@starpolice.academy",
      password: "student123",
      role: "student",
      isActive: true,
    },
  ];

  for (const entry of users) {
    const password = await bcrypt.hash(entry.password, 10);
    await User.findOneAndUpdate(
      { email: entry.email },
      {
        name: entry.name,
        email: entry.email,
        password,
        role: entry.role,
        isActive: entry.isActive,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded ${entry.role}: ${entry.email} / ${entry.password}`);
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
