import type { AuthUser } from "./types";

export const APP_NAME = "Star Police Academy";
export const APP_LOCATION = "Vellore";

export const DEMO_USERS: AuthUser[] = [
  {
    email: "admin@starpolice.academy",
    password: "admin123",
    role: "admin",
    name: "Academy Admin",
  },
  {
    email: "student@starpolice.academy",
    password: "student123",
    role: "student",
    name: "Student User",
  },
];

export const FILE_CATEGORY_LABELS = {
  video: "Videos",
  pdf: "PDF Files",
  image: "Images",
  document: "Documents",
} as const;
