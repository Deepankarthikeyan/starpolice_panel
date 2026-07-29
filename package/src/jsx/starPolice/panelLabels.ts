import type { PanelType } from "./types";

export function getPanelMotherMenu(panel?: PanelType) {
  if (panel === "student") return "Student Panel";
  if (panel === "staff") return "Staff Panel";
  return "Admin Panel";
}
