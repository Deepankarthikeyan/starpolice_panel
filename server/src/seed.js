import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const users = [
  {
    name: "Academy Admin",
    email: "admin@starpolice.academy",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Student User",
    email: "student@starpolice.academy",
    password: "student123",
    role: "student",
  },
];

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  for (const user of users) {
    const password = await bcrypt.hash(user.password, 10);
    await User.findOneAndUpdate(
      { email: user.email },
      { ...user, password },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded ${user.role}: ${user.email}`);
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
