import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import { ExamMarksTable } from "../shared/ExamMarksTable";
import PhysicalRecordCard from "../shared/PhysicalRecordCard";
import {
  buildPerformanceFormFromDetail,
  getTodayAttendanceStatus,
  mergeEventsWithDefaults,
  suggestOverallPerformance,
  type StudentPerformanceRecord,
} from "./performanceDefaults";
import { todayDateString } from "./attendanceDefaults";
import {
  examTypeLabel,
  formatPercent,
  type ExamType,
  type StudentExamMarkEntry,
  type StudentPerformanceDetail,
} from "./examDefaults";
import { type StudentPerformanceSummary } from "./performanceDefaults";

type SortKey = "studentId" | "fullName" | "batch" | "examPercent";
type SortDir = "asc" | "desc";

function compareValues(a: string | number | null | undefined, b: string | number | null | undefined) {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

interface ExamMarksEntryProps {
  examType: ExamType;
}

const ExamMarksEntry = ({ examType }: ExamMarksEntryProps) => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:performance");
  const pageTitle = examTypeLabel(examType);

  const [students, setStudents] = useState<StudentPerformanceSummary[]>([]);
  const [detail, setDetail] = useState<StudentPerformanceDetail | null>(null);
  const [exams, setExams] = useState<StudentExamMarkEntry[]>([]);
  const [performanceForm, setPerformanceForm] = useState<StudentPerformanceRecord | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

  const percentKey = examType === "physical_exam" ? "physicalExamPercent" : "writtenExamPercent";
  const isStaff = auth?.role === "staff" && auth.panel === "staff";
  const staffSubjectIds = auth?.subjectIds || [];
  const staffExamTypes = auth?.staffExamTypes || [];

  const filterExamsByStaffSubjects = (examList: StudentExamMarkEntry[]) => {
    if (!isStaff || staffSubjectIds.length === 0) {
      return examList;
    }
    return examList.filter((exam) => exam.subjectId && staffSubjectIds.includes(exam.subjectId));
  };

  const loadStudents = async () => {
    setListLoading(true);
    setListError("");
    try {
      const data = await api.getStudentPerformanceStudents();
      setStudents(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load students.";
      setListError(message);
      setStudents([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!canManage) return;
    loadStudents().catch(console.error);
  }, [canManage]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    let rows = students;
    if (query) {
      rows = rows.filter((student) =>
        [student.studentId, student.fullName, student.batch, student.gender]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }
    rows = [...rows].sort((a, b) => {
      const aValue = sortKey === "examPercent" ? a[percentKey] : a[sortKey];
      const bValue = sortKey === "examPercent" ? b[percentKey] : b[sortKey];
      const result = compareValues(aValue, bValue);
      return sortDir === "asc" ? result : -result;
    });
    return rows;
  }, [students, search, sortKey, sortDir, percentKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "");

  const openStudent = async (studentOnboardingId: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getStudentPerformanceDetail(studentOnboardingId);
      setDetail(data);
      if (examType === "physical_exam") {
        setPerformanceForm(buildPerformanceFormFromDetail(data));
      } else {
        setExams(filterExamsByStaffSubjects(data.writtenExams));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load student exam marks.";
      setError(message);
      notify.error(err, "Failed to load student exam marks.");
    } finally {
      setLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setExams([]);
    setPerformanceForm(null);
    setError("");
  };

  const savePhysicalRecord = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail || !performanceForm) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...performanceForm,
        recordDate: todayDateString(),
        overallPerformance:
          performanceForm.overallPerformance ||
          suggestOverallPerformance(mergeEventsWithDefaults(performanceForm.events, "all")),
      };
      await api.saveStudentPerformance(detail.student.studentOnboardingId, payload);

      notify.success("Physical exam record saved.");
      await loadStudents();
      await openStudent(detail.student.studentOnboardingId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save physical exam record.";
      setError(message);
      notify.error(err, "Failed to save physical exam record.");
    } finally {
      setSaving(false);
    }
  };

  const saveMarks = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail) return;
    setSaving(true);
    setError("");
    try {
      const marks = exams
        .filter((exam) => exam.scoredMarks !== "" && exam.scoredMarks !== null && exam.scoredMarks !== undefined)
        .map((exam) => ({
          examId: exam.examId,
          scoredMarks: Number(exam.scoredMarks),
          remarks: exam.remarks || "",
        }));

      if (marks.length > 0) {
        await api.saveStudentExamMarks(detail.student.studentOnboardingId, marks);
      }

      notify.success(`${pageTitle} marks saved.`);
      await loadStudents();
      await openStudent(detail.student.studentOnboardingId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save exam marks.";
      setError(message);
      notify.error(err, "Failed to save exam marks.");
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu={pageTitle} pageContent="" />
        <div className="alert alert-warning">You do not have permission to manage exam marks.</div>
      </>
    );
  }

  if (isStaff && !staffExamTypes.includes(examType)) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu={pageTitle} pageContent="" />
        <div className="alert alert-warning">
          You do not have any assigned subjects for {pageTitle.toLowerCase()}. Contact the super admin to update your subjects.
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu={pageTitle} pageContent="" />

      {!detail ? (
        <div className="card">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h4 className="card-title mb-0">{pageTitle} — Enter Marks</h4>
            <input
              type="search"
              className="form-control form-control-sm spa-toolbar-search"
              placeholder="Search name, register no., batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="card-body">
            {listError && (
              <div className="alert alert-danger">
                {listError}
                <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={loadStudents}>
                  Retry
                </button>
              </div>
            )}
            {listLoading ? (
              <p className="text-muted mb-0">Loading students...</p>
            ) : !filteredStudents.length ? (
              <p className="text-muted mb-0">No students found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>
                        <button type="button" className="btn btn-link p-0 spa-sort-btn" onClick={() => toggleSort("studentId")}>
                          Register No.{sortIndicator("studentId")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="btn btn-link p-0 spa-sort-btn" onClick={() => toggleSort("fullName")}>
                          Student Name{sortIndicator("fullName")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="btn btn-link p-0 spa-sort-btn" onClick={() => toggleSort("batch")}>
                          Batch{sortIndicator("batch")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="btn btn-link p-0 spa-sort-btn" onClick={() => toggleSort("examPercent")}>
                          {pageTitle}{sortIndicator("examPercent")}
                        </button>
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.studentOnboardingId}>
                        <td>{student.studentId}</td>
                        <td>{student.fullName}</td>
                        <td>{student.batch || "—"}</td>
                        <td>{formatPercent(student[percentKey])}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => openStudent(student.studentOnboardingId)}
                          >
                            Enter Marks
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="card mb-4">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h4 className="card-title mb-0">{detail.student.fullName}</h4>
                <small className="text-muted">
                  {detail.student.studentId} · Batch {detail.student.batch || "—"}
                </small>
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closeDetail}>
                Back to list
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : examType === "physical_exam" && performanceForm && detail ? (
            <form onSubmit={savePhysicalRecord}>
              <PhysicalRecordCard
                form={performanceForm}
                onChange={setPerformanceForm}
                todayAttendanceStatus={getTodayAttendanceStatus(detail.attendance)}
              />
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Physical Exam Record"}
              </button>
            </form>
          ) : (
            <form onSubmit={saveMarks}>
              <ExamMarksTable
                title={`${pageTitle} Marks`}
                exams={exams}
                onChange={setExams}
              />
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : `Save ${pageTitle} Marks`}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export const PhysicalExamEntry = () => <ExamMarksEntry examType="physical_exam" />;
export const WrittenExamEntry = () => <ExamMarksEntry examType="written_exam" />;

export default ExamMarksEntry;
