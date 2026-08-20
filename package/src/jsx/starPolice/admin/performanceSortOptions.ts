import type { StudentPerformanceSummary } from "./performanceDefaults";

export type PerformanceFieldSortKey =
  | "studentId"
  | "fullName"
  | "batch"
  | "attendancePercent"
  | "physicalExamPercent"
  | "writtenExamPercent"
  | "overallPercent";

export type PerformanceSortDir = "asc" | "desc";

export interface PerformanceSortOption {
  id: string;
  label: string;
  field?: PerformanceFieldSortKey;
  dir?: PerformanceSortDir;
  compare: (a: StudentPerformanceSummary, b: StudentPerformanceSummary) => number;
}

export interface PerformanceSortGroup {
  label: string;
  options: PerformanceSortOption[];
}

function percentValue(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return Number(value);
}

function comparePercent(a: number | null, b: number | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

function compareField(key: PerformanceFieldSortKey, dir: PerformanceSortDir) {
  return (a: StudentPerformanceSummary, b: StudentPerformanceSummary) => {
    const aVal = a[key];
    const bVal = b[key];
    const isPercent = key.endsWith("Percent");
    const result = isPercent
      ? comparePercent(percentValue(aVal as number), percentValue(bVal as number))
      : String(aVal ?? "").localeCompare(String(bVal ?? ""), undefined, { sensitivity: "base" });
    return dir === "asc" ? result : -result;
  };
}

function categoryPercents(student: StudentPerformanceSummary) {
  return [
    percentValue(student.attendancePercent),
    percentValue(student.physicalExamPercent),
    percentValue(student.writtenExamPercent),
  ].filter((value): value is number => value !== null);
}

function balancedScore(student: StudentPerformanceSummary) {
  const values = categoryPercents(student);
  if (!values.length) return null;
  return Math.min(...values);
}

function strongestScore(student: StudentPerformanceSummary) {
  const values = categoryPercents(student);
  if (!values.length) return null;
  return Math.max(...values);
}

function spreadScore(student: StudentPerformanceSummary) {
  const values = categoryPercents(student);
  if (values.length < 2) return null;
  return Math.max(...values) - Math.min(...values);
}

function compareNumericDesc(
  getter: (student: StudentPerformanceSummary) => number | null,
  tiebreaker?: (a: StudentPerformanceSummary, b: StudentPerformanceSummary) => number
) {
  return (a: StudentPerformanceSummary, b: StudentPerformanceSummary) => {
    const result = comparePercent(getter(a), getter(b));
    if (result === 0) {
      return tiebreaker ? tiebreaker(a, b) : 0;
    }
    return -result;
  };
}

function compareNumericAsc(getter: (student: StudentPerformanceSummary) => number | null) {
  return (a: StudentPerformanceSummary, b: StudentPerformanceSummary) =>
    comparePercent(getter(a), getter(b));
}

function compareThen(
  primary: (a: StudentPerformanceSummary, b: StudentPerformanceSummary) => number,
  secondary: (a: StudentPerformanceSummary, b: StudentPerformanceSummary) => number
) {
  return (a: StudentPerformanceSummary, b: StudentPerformanceSummary) => {
    const result = primary(a, b);
    return result !== 0 ? result : secondary(a, b);
  };
}

export const PERFORMANCE_SORT_GROUPS: PerformanceSortGroup[] = [
  {
    label: "Quick picks",
    options: [
      {
        id: "top-performers",
        label: "Top performers first",
        field: "overallPercent",
        dir: "desc",
        compare: compareField("overallPercent", "desc"),
      },
      {
        id: "needs-coaching",
        label: "Needs coaching first",
        field: "overallPercent",
        dir: "asc",
        compare: compareField("overallPercent", "asc"),
      },
      {
        id: "attendance-champions",
        label: "Attendance champions",
        field: "attendancePercent",
        dir: "desc",
        compare: compareField("attendancePercent", "desc"),
      },
      {
        id: "physical-elites",
        label: "Physical elites",
        field: "physicalExamPercent",
        dir: "desc",
        compare: compareField("physicalExamPercent", "desc"),
      },
      {
        id: "written-scholars",
        label: "Written scholars",
        field: "writtenExamPercent",
        dir: "desc",
        compare: compareField("writtenExamPercent", "desc"),
      },
    ],
  },
  {
    label: "Smart insights",
    options: [
      {
        id: "all-rounders",
        label: "All-rounders (balanced across areas)",
        compare: compareNumericDesc(balancedScore, compareField("overallPercent", "desc")),
      },
      {
        id: "weakest-link",
        label: "Weakest area first",
        compare: compareNumericAsc(balancedScore),
      },
      {
        id: "most-inconsistent",
        label: "Most inconsistent profile",
        compare: compareNumericDesc(spreadScore),
      },
      {
        id: "hidden-strength",
        label: "Hidden strength (best single area)",
        compare: compareNumericDesc(strongestScore),
      },
      {
        id: "attendance-then-overall",
        label: "Attendance, then overall",
        compare: compareThen(
          compareField("attendancePercent", "desc"),
          compareField("overallPercent", "desc")
        ),
      },
      {
        id: "physical-then-overall",
        label: "Physical, then overall",
        compare: compareThen(
          compareField("physicalExamPercent", "desc"),
          compareField("overallPercent", "desc")
        ),
      },
      {
        id: "written-then-overall",
        label: "Written, then overall",
        compare: compareThen(
          compareField("writtenExamPercent", "desc"),
          compareField("overallPercent", "desc")
        ),
      },
    ],
  },
  {
    label: "Overall score",
    options: [
      {
        id: "overall-desc",
        label: "Overall % — high to low",
        field: "overallPercent",
        dir: "desc",
        compare: compareField("overallPercent", "desc"),
      },
      {
        id: "overall-asc",
        label: "Overall % — low to high",
        field: "overallPercent",
        dir: "asc",
        compare: compareField("overallPercent", "asc"),
      },
    ],
  },
  {
    label: "By category",
    options: [
      {
        id: "attendance-desc",
        label: "Attendance % — high to low",
        field: "attendancePercent",
        dir: "desc",
        compare: compareField("attendancePercent", "desc"),
      },
      {
        id: "attendance-asc",
        label: "Attendance % — low to high",
        field: "attendancePercent",
        dir: "asc",
        compare: compareField("attendancePercent", "asc"),
      },
      {
        id: "physical-desc",
        label: "Physical exam % — high to low",
        field: "physicalExamPercent",
        dir: "desc",
        compare: compareField("physicalExamPercent", "desc"),
      },
      {
        id: "physical-asc",
        label: "Physical exam % — low to high",
        field: "physicalExamPercent",
        dir: "asc",
        compare: compareField("physicalExamPercent", "asc"),
      },
      {
        id: "written-desc",
        label: "Written exam % — high to low",
        field: "writtenExamPercent",
        dir: "desc",
        compare: compareField("writtenExamPercent", "desc"),
      },
      {
        id: "written-asc",
        label: "Written exam % — low to high",
        field: "writtenExamPercent",
        dir: "asc",
        compare: compareField("writtenExamPercent", "asc"),
      },
    ],
  },
  {
    label: "Student details",
    options: [
      {
        id: "name-asc",
        label: "Student name (A → Z)",
        field: "fullName",
        dir: "asc",
        compare: compareField("fullName", "asc"),
      },
      {
        id: "name-desc",
        label: "Student name (Z → A)",
        field: "fullName",
        dir: "desc",
        compare: compareField("fullName", "desc"),
      },
      {
        id: "register-asc",
        label: "Register no. (A → Z)",
        field: "studentId",
        dir: "asc",
        compare: compareField("studentId", "asc"),
      },
      {
        id: "register-desc",
        label: "Register no. (Z → A)",
        field: "studentId",
        dir: "desc",
        compare: compareField("studentId", "desc"),
      },
      {
        id: "batch-asc",
        label: "Batch (A → Z)",
        field: "batch",
        dir: "asc",
        compare: compareField("batch", "asc"),
      },
      {
        id: "batch-desc",
        label: "Batch (Z → A)",
        field: "batch",
        dir: "desc",
        compare: compareField("batch", "desc"),
      },
    ],
  },
];

export const PERFORMANCE_SORT_OPTIONS = PERFORMANCE_SORT_GROUPS.flatMap((group) => group.options);

export const PERFORMANCE_SORT_BY_ID = new Map(
  PERFORMANCE_SORT_OPTIONS.map((option) => [option.id, option])
);

export const DEFAULT_PERFORMANCE_SORT_ID = "top-performers";

export function getPerformanceSortOption(id: string) {
  return PERFORMANCE_SORT_BY_ID.get(id) ?? PERFORMANCE_SORT_BY_ID.get(DEFAULT_PERFORMANCE_SORT_ID)!;
}

export function findPerformanceSortId(field: PerformanceFieldSortKey, dir: PerformanceSortDir) {
  const match = PERFORMANCE_SORT_OPTIONS.find(
    (option) => option.field === field && option.dir === dir
  );
  return match?.id ?? `${field}-${dir}`;
}
