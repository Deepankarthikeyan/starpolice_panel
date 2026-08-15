export type PerformanceCardType = "female" | "male";
export type OverallPerformance = "" | "excellent" | "very_good" | "good" | "average";

export interface PerformanceEvent {
  eventKey: string;
  performance: string;
  singleStar: string;
  doubleStar: string;
  remarks: string;
}

export interface PerformanceEventDefinition {
  eventKey: string;
  label: string;
  benchmark: string;
}

export interface StudentPerformanceStudent {
  studentOnboardingId?: string;
  studentId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName: string;
  batch: string;
  gender: string;
  dateOfBirth?: string;
}

export interface StudentPerformanceRecord {
  id?: string;
  hasRecord?: boolean;
  studentOnboardingId: string;
  userId?: string | null;
  cardType: PerformanceCardType;
  recordYear: number;
  recordDate?: string;
  age: string;
  heightCm: string;
  weightKg: string;
  chestNormalCm: string;
  chestExpansionCm: string;
  events: PerformanceEvent[];
  overallPerformance: OverallPerformance;
  trainerRemarks: string;
  student?: StudentPerformanceStudent;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPerformanceSummary {
  studentOnboardingId: string;
  studentId: string;
  fullName: string;
  batch: string;
  gender: string;
  mobileNumber?: string;
  userId: string | null;
  cardType: PerformanceCardType;
  overallPerformance: OverallPerformance;
  hasRecord: boolean;
  performanceId: string | null;
  updatedAt: string | null;
  attendancePercent?: number | null;
  attendanceTotal?: number;
  physicalExamPercent?: number | null;
  writtenExamPercent?: number | null;
  overallPercent?: number | null;
}

export const FEMALE_EVENT_DEFINITIONS: PerformanceEventDefinition[] = [
  { eventKey: "400mts_run", label: "400mts Run sec", benchmark: "2min 30 sec qualified" },
  { eventKey: "long_jump", label: "Long Jump m", benchmark: "3.75 / 3 m" },
  { eventKey: "ball_throw", label: "Ball Throw", benchmark: "24m / 17m" },
  { eventKey: "shot_put", label: "shot put", benchmark: "5.50m / 4.25m" },
  {
    eventKey: "sprint_200_100",
    label: "200m Run sec / 100m Run sec",
    benchmark: "33.00sec / 38.00sec — 15.50sec / 17.50sec",
  },
];

export const MALE_EVENT_DEFINITIONS: PerformanceEventDefinition[] = [
  { eventKey: "run_1500mts", label: "1500mts Run sec", benchmark: "7min qualified" },
  { eventKey: "rope_climbing", label: "Rope Climbing", benchmark: "6m / 5m" },
  {
    eventKey: "jump_long_high",
    label: "Long Jump m / High Jump",
    benchmark: "4.50 / 3.80m — 1.40 / 1.20m",
  },
  {
    eventKey: "sprint_100_400",
    label: "100m Run sec / 400m Run sec",
    benchmark: "13.50 / 15.50sec — 70 / 80sec",
  },
];

/** All events from both TNUSRB physical record card templates combined. */
export const ALL_EVENT_DEFINITIONS: PerformanceEventDefinition[] = [
  ...FEMALE_EVENT_DEFINITIONS,
  ...MALE_EVENT_DEFINITIONS,
];

export const OVERALL_PERFORMANCE_OPTIONS: { value: OverallPerformance; label: string }[] = [
  { value: "excellent", label: "Excellent" },
  { value: "very_good", label: "Very Good" },
  { value: "good", label: "Good" },
  { value: "average", label: "Average" },
];

export function getCardTypeFromGender(gender = ""): PerformanceCardType {
  const value = gender.toLowerCase();
  if (value.includes("female") || value === "f" || value.includes("woman") || value.includes("girl")) {
    return "female";
  }
  return "male";
}

export function getEventDefinitions(cardType?: PerformanceCardType | "all") {
  if (cardType === "female") return FEMALE_EVENT_DEFINITIONS;
  if (cardType === "male") return MALE_EVENT_DEFINITIONS;
  return ALL_EVENT_DEFINITIONS;
}

export const PHYSICAL_RECORD_SECTIONS: {
  key: PerformanceCardType;
  title: string;
  definitions: PerformanceEventDefinition[];
}[] = [
  { key: "female", title: "Female Physical Standard Events", definitions: FEMALE_EVENT_DEFINITIONS },
  { key: "male", title: "Male Physical Standard Events", definitions: MALE_EVENT_DEFINITIONS },
];

export function mergeEventsWithDefaults(
  saved: PerformanceEvent[] = [],
  cardType?: PerformanceCardType | "all"
): PerformanceEvent[] {
  const definitions = getEventDefinitions(cardType);
  const byKey = new Map(saved.map((event) => [event.eventKey, event]));

  // Migrate legacy sprint_run key from older records
  const legacySprint = byKey.get("sprint_run");
  if (legacySprint) {
    if (!byKey.has("sprint_200_100")) {
      byKey.set("sprint_200_100", { ...legacySprint, eventKey: "sprint_200_100" });
    }
    if (!byKey.has("sprint_100_400")) {
      byKey.set("sprint_100_400", { ...legacySprint, eventKey: "sprint_100_400" });
    }
    byKey.delete("sprint_run");
  }

  return definitions.map((definition) => {
    const existing = byKey.get(definition.eventKey);
    return existing
      ? { ...existing }
      : {
          eventKey: definition.eventKey,
          performance: "",
          singleStar: "",
          doubleStar: "",
          remarks: "",
        };
  });
}

export function defaultEvents(cardType: PerformanceCardType = "male"): PerformanceEvent[] {
  return mergeEventsWithDefaults([], cardType);
}

export function emptyPerformanceForm(
  studentOnboardingId: string,
  cardType: PerformanceCardType,
  student?: StudentPerformanceStudent
): StudentPerformanceRecord {
  return {
    studentOnboardingId,
    cardType,
    recordYear: new Date().getFullYear(),
    recordDate: new Date().toISOString().slice(0, 10),
    age: "",
    heightCm: "",
    weightKg: "",
    chestNormalCm: "",
    chestExpansionCm: "",
    events: defaultEvents(cardType),
    overallPerformance: "",
    trainerRemarks: "",
    student,
  };
}

export function overallPerformanceLabel(value: OverallPerformance) {
  return OVERALL_PERFORMANCE_OPTIONS.find((item) => item.value === value)?.label || "Not rated";
}

export function overallPerformanceBadgeClass(value: OverallPerformance) {
  switch (value) {
    case "excellent":
      return "badge-success";
    case "very_good":
      return "badge-primary";
    case "good":
      return "badge-info";
    case "average":
      return "badge-warning";
    default:
      return "badge-light text-dark";
  }
}

export function countStars(events: PerformanceEvent[]) {
  let single = 0;
  let double = 0;
  events.forEach((event) => {
    if (isStarChecked(event.singleStar)) single += 1;
    if (isStarChecked(event.doubleStar)) double += 1;
  });
  return { single, double };
}

export function isStarChecked(value: string | undefined) {
  return value === "1" || value === "true" || Boolean(value?.trim());
}

export function suggestOverallPerformance(events: PerformanceEvent[]): OverallPerformance {
  const { single, double } = countStars(events);
  const total = events.length;
  if (!total) return "";
  if (double >= Math.ceil(total * 0.7)) return "excellent";
  if (double + single >= Math.ceil(total * 0.7)) return "very_good";
  if (single + double >= Math.ceil(total * 0.4)) return "good";
  if (single + double > 0) return "average";
  return "";
}

export function recordToForm(record: StudentPerformanceRecord): StudentPerformanceRecord {
  return {
    ...record,
    events: mergeEventsWithDefaults(record.events, record.cardType),
  };
}

export function buildPerformanceFormFromDetail(detail: {
  student: {
    studentOnboardingId: string;
    studentId: string;
    fullName: string;
    batch: string;
    gender: string;
    dateOfBirth?: string;
  };
  performance: StudentPerformanceRecord & { hasRecord?: boolean };
}): StudentPerformanceRecord {
  const { student, performance } = detail;
  const studentInfo = {
    studentOnboardingId: student.studentOnboardingId,
    studentId: student.studentId,
    fullName: student.fullName,
    batch: student.batch,
    gender: student.gender,
    dateOfBirth: student.dateOfBirth,
  };
  const cardType = performance.cardType || getCardTypeFromGender(student.gender);

  if (performance.hasRecord) {
    return {
      ...recordToForm({
        ...(performance as StudentPerformanceRecord),
        cardType,
        student: studentInfo,
      }),
      recordDate: new Date().toISOString().slice(0, 10),
    };
  }

  return {
    ...emptyPerformanceForm(student.studentOnboardingId, cardType, studentInfo),
    recordDate: new Date().toISOString().slice(0, 10),
  };
}

export function computeAttendanceStats(attendance: Array<{ status: string }>) {
  const stats = { present: 0, absent: 0, leave: 0 };
  attendance.forEach((item) => {
    if (item.status === "present" || item.status === "late") stats.present += 1;
    else if (item.status === "absent") stats.absent += 1;
    else if (item.status === "leave") stats.leave += 1;
  });
  return stats;
}

export function getEventsForCardType(events: PerformanceEvent[], cardType: PerformanceCardType) {
  const keys = new Set(getEventDefinitions(cardType).map((definition) => definition.eventKey));
  return events.filter((event) => keys.has(event.eventKey));
}

export function getTodayAttendanceStatus(
  attendance: Array<{ date: string; status: string }>,
  date = new Date().toISOString().slice(0, 10)
) {
  return attendance.find((item) => item.date === date)?.status || "";
}
