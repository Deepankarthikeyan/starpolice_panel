import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Subject from "./models/Subject.js";
import Exam from "./models/Exam.js";
import StudentOnboarding from "./models/StudentOnboarding.js";
import StudentExamMark from "./models/StudentExamMark.js";
import { defaultPermissionsForRole } from "./permissions.js";

dotenv.config();

const TEMP_SUBJECTS = [
  "General Knowledge",
  "English",
  "Tamil",
  "Mathematics",
  "Indian Polity",
  "Reasoning",
  "Long Run",
  "High Jump",
  "Shot Put",
  "100m Sprint",
];

const TEMP_EXAMS = [
  { name: "GK Test 1", examType: "written_exam", subject: "General Knowledge", totalMarks: 100 },
  { name: "English Test 1", examType: "written_exam", subject: "English", totalMarks: 50 },
  { name: "Tamil Test 1", examType: "written_exam", subject: "Tamil", totalMarks: 50 },
  { name: "Maths Test 1", examType: "written_exam", subject: "Mathematics", totalMarks: 100 },
  { name: "Polity Test 1", examType: "written_exam", subject: "Indian Polity", totalMarks: 50 },
  { name: "Reasoning Test 1", examType: "written_exam", subject: "Reasoning", totalMarks: 50 },
  { name: "1600m Run", examType: "physical_exam", subject: "Long Run", totalMarks: 100 },
  { name: "High Jump", examType: "physical_exam", subject: "High Jump", totalMarks: 50 },
  { name: "Shot Put", examType: "physical_exam", subject: "Shot Put", totalMarks: 50 },
  { name: "100m Sprint", examType: "physical_exam", subject: "100m Sprint", totalMarks: 100 },
];

const TEMP_STUDENTS = [
  {
    studentId: "SPA2025001",
    firstName: "Demo",
    lastName: "Student",
    gender: "male",
    batch: "Batch A",
    mobileNumber: "9876543210",
    email: "student@starpolice.academy",
    loginEmail: "student@starpolice.academy",
    course: "TNUSRB Constable",
    residenceType: "Day Scholar",
    admissionDate: "2025-01-15",
  },
  {
    studentId: "SPA2025002",
    firstName: "Rajesh",
    lastName: "Kumar",
    gender: "male",
    batch: "Batch A",
    mobileNumber: "9876543211",
    email: "rajesh.kumar@example.com",
    course: "TNUSRB Constable",
    residenceType: "Day Scholar",
    admissionDate: "2025-01-15",
  },
  {
    studentId: "SPA2025003",
    firstName: "Priya",
    lastName: "Devi",
    gender: "female",
    batch: "Batch A",
    mobileNumber: "9876543212",
    email: "priya.devi@example.com",
    course: "TNUSRB Constable",
    residenceType: "Day Scholar",
    admissionDate: "2025-01-15",
  },
  {
    studentId: "SPA2025004",
    firstName: "Arun",
    lastName: "Murugan",
    gender: "male",
    batch: "Batch B",
    mobileNumber: "9876543213",
    email: "arun.murugan@example.com",
    course: "TNUSRB Constable",
    residenceType: "Hostel",
    admissionDate: "2025-02-01",
  },
  {
    studentId: "SPA2025005",
    firstName: "Kavitha",
    lastName: "Selvam",
    gender: "female",
    batch: "Batch B",
    mobileNumber: "9876543214",
    email: "kavitha.selvam@example.com",
    course: "TNUSRB Constable",
    residenceType: "Hostel",
    admissionDate: "2025-02-01",
  },
];

async function seedSubjects(superadminId) {
  const subjectMap = new Map();
  for (const name of TEMP_SUBJECTS) {
    const subject = await Subject.findOneAndUpdate(
      { name },
      { name, isActive: true, createdBy: superadminId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    subjectMap.set(name, subject);
  }
  console.log(`Seeded ${subjectMap.size} subjects.`);
  return subjectMap;
}

async function seedExams(subjectMap, superadminId) {
  const examMap = new Map();
  for (const item of TEMP_EXAMS) {
    const subject = subjectMap.get(item.subject);
    const exam = await Exam.findOneAndUpdate(
      { name: item.name, examType: item.examType },
      {
        name: item.name,
        examType: item.examType,
        subjectId: subject?._id || null,
        totalMarks: item.totalMarks,
        isActive: true,
        createdBy: superadminId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    examMap.set(`${item.examType}:${item.name}`, exam);
  }
  console.log(`Seeded ${examMap.size} exams.`);
  return examMap;
}

async function seedStudents(superadminId, studentUserId) {
  const studentMap = new Map();
  for (const item of TEMP_STUDENTS) {
    const update = {
      ...item,
      termsAccepted: true,
      privacyAccepted: true,
      createdBy: superadminId,
    };
    if (item.loginEmail === "student@starpolice.academy" && studentUserId) {
      update.userId = studentUserId;
    }
    const student = await StudentOnboarding.findOneAndUpdate(
      { studentId: item.studentId },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    studentMap.set(item.studentId, student);
  }
  console.log(`Seeded ${studentMap.size} student onboarding records.`);
  return studentMap;
}

async function seedSampleMarks(studentMap, examMap) {
  const demoStudent = studentMap.get("SPA2025001");
  if (!demoStudent) return;

  const sampleMarks = [
    { examKey: "written_exam:GK Test 1", scoredMarks: 72, remarks: "Good effort" },
    { examKey: "written_exam:English Test 1", scoredMarks: 38, remarks: "" },
    { examKey: "written_exam:Tamil Test 1", scoredMarks: 42, remarks: "" },
    { examKey: "physical_exam:1600m Run", scoredMarks: 80, remarks: "Completed in time" },
    { examKey: "physical_exam:High Jump", scoredMarks: 35, remarks: "" },
  ];

  let count = 0;
  for (const mark of sampleMarks) {
    const exam = examMap.get(mark.examKey);
    if (!exam) continue;
    await StudentExamMark.findOneAndUpdate(
      { studentOnboardingId: demoStudent._id, examId: exam._id },
      {
        studentOnboardingId: demoStudent._id,
        examId: exam._id,
        scoredMarks: mark.scoredMarks,
        remarks: mark.remarks,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    count += 1;
  }
  console.log(`Seeded ${count} sample exam marks for demo student.`);
}

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  const password = await bcrypt.hash("superadmin123", 10);
  const superadmin = await User.findOneAndUpdate(
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
  const studentUser = await User.findOneAndUpdate(
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

  const subjectMap = await seedSubjects(superadmin._id);
  const examMap = await seedExams(subjectMap, superadmin._id);
  const writtenSubjectIds = [
    subjectMap.get("General Knowledge")?._id,
    subjectMap.get("English")?._id,
    subjectMap.get("Tamil")?._id,
  ].filter(Boolean);

  await User.findOneAndUpdate(
    { email: "staff@starpolice.academy" },
    {
      staffType: "subject",
      subjectIds: writtenSubjectIds,
    }
  );
  console.log("Seeded staff subjects: General Knowledge, English, Tamil");

  const studentMap = await seedStudents(superadmin._id, studentUser._id);
  await seedSampleMarks(studentMap, examMap);

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
