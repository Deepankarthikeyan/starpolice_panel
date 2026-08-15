import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import {
  buildPerformanceWhatsAppMessage,
  buildWhatsAppLink,
  formatPercent,
  type StudentExamMarkEntry,
  type StudentPerformanceDetail,
} from "./examDefaults";
import { todayDateString } from "./attendanceDefaults";
import {
  buildPerformanceFormFromDetail,
  getEventsForCardType,
  getTodayAttendanceStatus,
  overallPerformanceLabel,
  suggestOverallPerformance,
  type StudentPerformanceRecord,
  type StudentPerformanceSummary,
} from "./performanceDefaults";
import { AttendancePerformanceList } from "../shared/PerformanceDetailPanels";
import { ExamMarksTable } from "../shared/ExamMarksTable";
import PhysicalRecordCard from "../shared/PhysicalRecordCard";

type SortKey =
  | "studentId"
  | "fullName"
  | "batch"
  | "attendancePercent"
  | "physicalExamPercent"
  | "writtenExamPercent"
  | "overallPercent";

type SortDir = "asc" | "desc";

type PerformanceSection = "attendance" | "physical" | "written";

function compareValues(a: string | number | null | undefined, b: string | number | null | undefined) {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

function PerformanceSummaryCard({
  label,
  value,
  subtext,
  active,
  onClick,
  clickable = true,
}: {
  label: string;
  value: string;
  subtext?: string;
  active?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}) {
  const content = (
    <div className="card-body spa-performance-card-body">
      <p className="spa-performance-card-label text-muted mb-2">{label}</p>
      <p className="spa-performance-card-value mb-1">{value}</p>
      {subtext && <p className="spa-performance-card-subtext text-muted mb-0">{subtext}</p>}
    </div>
  );

  if (!clickable) {
    return (
      <div className="col-md-3 col-sm-6">
        <div className="card h-100 spa-performance-card">{content}</div>
      </div>
    );
  }

  return (
    <div className="col-md-3 col-sm-6">
      <button
        type="button"
        className={`card h-100 w-100 text-start spa-performance-card ${active ? "is-active" : ""}`}
        onClick={onClick}
      >
        {content}
      </button>
    </div>
  );
}

const StudentPerformance = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:performance");
  const printRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<StudentPerformanceSummary[]>([]);
  const [detail, setDetail] = useState<StudentPerformanceDetail | null>(null);
  const [writtenExams, setWrittenExams] = useState<StudentExamMarkEntry[]>([]);
  const [performanceForm, setPerformanceForm] = useState<StudentPerformanceRecord | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [activeSection, setActiveSection] = useState<PerformanceSection>("attendance");

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
      const result = compareValues(a[sortKey], b[sortKey]);
      return sortDir === "asc" ? result : -result;
    });
    return rows;
  }, [students, search, sortKey, sortDir]);

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
      setWrittenExams(data.writtenExams);
      setPerformanceForm(buildPerformanceFormFromDetail(data));
      setActiveSection("attendance");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load student performance.";
      setError(message);
      notify.error(err, "Failed to load student performance.");
    } finally {
      setLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setWrittenExams([]);
    setPerformanceForm(null);
    setActiveSection("attendance");
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
          suggestOverallPerformance(getEventsForCardType(performanceForm.events, performanceForm.cardType)),
      };
      await api.saveStudentPerformance(detail.student.studentOnboardingId, payload);

      notify.success("Physical exam record saved.");
      await loadStudents();
      await openStudent(detail.student.studentOnboardingId);
      setActiveSection("physical");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save physical exam record.";
      setError(message);
      notify.error(err, "Failed to save physical exam record.");
    } finally {
      setSaving(false);
    }
  };

  const saveWrittenExamMarks = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail) return;
    setSaving(true);
    setError("");
    try {
      const marks = writtenExams
        .filter((exam) => exam.scoredMarks !== "" && exam.scoredMarks !== null && exam.scoredMarks !== undefined)
        .map((exam) => ({
          examId: exam.examId,
          scoredMarks: Number(exam.scoredMarks),
          remarks: exam.remarks || "",
        }));

      if (marks.length > 0) {
        await api.saveStudentExamMarks(detail.student.studentOnboardingId, marks);
      }

      notify.success("Written exam marks saved.");
      await loadStudents();
      await openStudent(detail.student.studentOnboardingId);
      setActiveSection("written");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save exam marks.";
      setError(message);
      notify.error(err, "Failed to save exam marks.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!detail) return;
    const message = buildPerformanceWhatsAppMessage(
      detail.student.fullName,
      detail.student.studentId,
      detail.summary
    );
    const link = buildWhatsAppLink(detail.student.mobileNumber, message);
    if (!link) {
      notify.error(new Error("Mobile number not available for this student."), "WhatsApp unavailable");
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  };

  if (!canManage) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Student Performance" pageContent="" />
        <div className="alert alert-warning">You do not have permission to manage student performance.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Student Performance" pageContent="" />

      {!detail ? (
        <div className="card">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2 spa-no-print">
            <h4 className="card-title mb-0">Student Performance Overview</h4>
            <input
              type="search"
              className="form-control form-control-sm"
              style={{ maxWidth: "320px" }}
              placeholder="Search name, register no., batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="card-body">
            {listError && (
              <div className="alert alert-danger spa-no-print">
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
                        <button type="button" className="btn btn-link p-0 spa-sort-btn" onClick={() => toggleSort("attendancePercent")}>
                          Attendance{sortIndicator("attendancePercent")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="btn btn-link p-0 spa-sort-btn" onClick={() => toggleSort("physicalExamPercent")}>
                          Physical Exam{sortIndicator("physicalExamPercent")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="btn btn-link p-0 spa-sort-btn" onClick={() => toggleSort("writtenExamPercent")}>
                          Written Exam{sortIndicator("writtenExamPercent")}
                        </button>
                      </th>
                      <th>
                        <button type="button" className="btn btn-link p-0 spa-sort-btn" onClick={() => toggleSort("overallPercent")}>
                          Overall{sortIndicator("overallPercent")}
                        </button>
                      </th>
                      <th className="spa-no-print"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.studentOnboardingId}>
                        <td>{student.studentId}</td>
                        <td>{student.fullName}</td>
                        <td>{student.batch || "—"}</td>
                        <td>{formatPercent(student.attendancePercent)}</td>
                        <td>{formatPercent(student.physicalExamPercent)}</td>
                        <td>{formatPercent(student.writtenExamPercent)}</td>
                        <td>
                          <span className="badge bg-primary">{formatPercent(student.overallPercent)}</span>
                        </td>
                        <td className="spa-no-print">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => openStudent(student.studentOnboardingId)}
                          >
                            View Details
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
        <div ref={printRef} className="spa-performance-detail">
          <div className="card spa-no-print">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h4 className="card-title mb-0">{detail.student.fullName}</h4>
                <small className="text-muted">
                  {detail.student.studentId} · Batch {detail.student.batch || "—"}
                </small>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closeDetail}>
                  Back to list
                </button>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={handlePrint}>
                  <i className="fa fa-print me-1" /> Print / PDF
                </button>
                <button type="button" className="btn btn-sm btn-outline-success" onClick={handleWhatsApp}>
                  <i className="fab fa-whatsapp me-1" /> WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div className="spa-print-only mb-3">
            <h4 className="mb-1">Star Police Academy — Student Performance Report</h4>
            <p className="mb-0">
              {detail.student.fullName} · {detail.student.studentId} · Batch {detail.student.batch || "—"}
            </p>
          </div>

          {error && <div className="alert alert-danger spa-no-print">{error}</div>}

          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <>
              <div className="row mb-4 g-3">
                <PerformanceSummaryCard
                  label="Attendance"
                  value={formatPercent(detail.summary.attendancePercent)}
                  subtext={`${detail.summary.attendancePresent}/${detail.summary.attendanceTotal} days`}
                  active={activeSection === "attendance"}
                  onClick={() => setActiveSection("attendance")}
                />
                <PerformanceSummaryCard
                  label="Physical Exam"
                  value={formatPercent(detail.summary.physicalExamPercent)}
                  active={activeSection === "physical"}
                  onClick={() => setActiveSection("physical")}
                />
                <PerformanceSummaryCard
                  label="Written Exam"
                  value={formatPercent(detail.summary.writtenExamPercent)}
                  active={activeSection === "written"}
                  onClick={() => setActiveSection("written")}
                />
                <PerformanceSummaryCard
                  label="Overall Performance"
                  value={formatPercent(detail.summary.overallPercent)}
                  subtext={
                    detail.summary.overallPerformance
                      ? overallPerformanceLabel(detail.summary.overallPerformance as never)
                      : undefined
                  }
                  clickable={false}
                />
              </div>

              {activeSection === "attendance" && detail && (
                <AttendancePerformanceList
                  attendance={detail.attendance}
                  attendancePercent={detail.summary.attendancePercent}
                />
              )}

              {activeSection === "physical" && performanceForm && detail && (
                <form onSubmit={savePhysicalRecord}>
                  <PhysicalRecordCard
                    form={performanceForm}
                    onChange={setPerformanceForm}
                    todayAttendanceStatus={getTodayAttendanceStatus(detail.attendance)}
                  />
                  <button type="submit" className="btn btn-primary spa-no-print" disabled={saving}>
                    {saving ? "Saving..." : "Save Physical Exam Record"}
                  </button>
                </form>
              )}

              {activeSection === "written" && (
                <form onSubmit={saveWrittenExamMarks}>
                  <ExamMarksTable
                    title="Written Exam Performance"
                    exams={writtenExams}
                    onChange={setWrittenExams}
                  />
                  <button type="submit" className="btn btn-primary spa-no-print" disabled={saving}>
                    {saving ? "Saving..." : "Save Written Exam Marks"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default StudentPerformance;
