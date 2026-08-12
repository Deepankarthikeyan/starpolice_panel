import { FormEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import PhysicalRecordCard from "../shared/PhysicalRecordCard";
import {
  buildPerformanceWhatsAppMessage,
  buildWhatsAppLink,
  formatPercent,
  type StudentExamMarkEntry,
  type StudentPerformanceDetail,
} from "./examDefaults";
import {
  emptyPerformanceForm,
  getCardTypeFromGender,
  overallPerformanceBadgeClass,
  overallPerformanceLabel,
  recordToForm,
  suggestOverallPerformance,
  type StudentPerformanceRecord,
  type StudentPerformanceSummary,
} from "./performanceDefaults";

type SortKey =
  | "studentId"
  | "fullName"
  | "batch"
  | "attendancePercent"
  | "physicalExamPercent"
  | "writtenExamPercent"
  | "overallPercent";

type SortDir = "asc" | "desc";

function compareValues(a: string | number | null | undefined, b: string | number | null | undefined) {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

function ExamMarksTable({
  title,
  exams,
  onChange,
  readOnly = false,
}: {
  title: string;
  exams: StudentExamMarkEntry[];
  onChange?: (next: StudentExamMarkEntry[]) => void;
  readOnly?: boolean;
}) {
  const setMark = (examId: string, key: "scoredMarks" | "remarks", value: string) => {
    if (!onChange) return;
    onChange(
      exams.map((exam) =>
        exam.examId === examId ? { ...exam, [key]: key === "scoredMarks" ? value : value } : exam
      )
    );
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">
        {exams.length === 0 ? (
          <p className="text-muted mb-0">No exams configured. Add exams under Master → Exams.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Out of</th>
                  <th>Scored</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.examId}>
                    <td>{exam.name}</td>
                    <td>{exam.subjectName || "—"}</td>
                    <td>{exam.totalMarks}</td>
                    <td>
                      {readOnly ? (
                        exam.scoredMarks || "—"
                      ) : (
                        <input
                          type="number"
                          min={0}
                          max={exam.totalMarks}
                          className="form-control form-control-sm"
                          value={exam.scoredMarks}
                          onChange={(e) => setMark(exam.examId, "scoredMarks", e.target.value)}
                        />
                      )}
                    </td>
                    <td>
                      {readOnly ? (
                        exam.remarks || "—"
                      ) : (
                        <input
                          className="form-control form-control-sm"
                          value={exam.remarks}
                          onChange={(e) => setMark(exam.examId, "remarks", e.target.value)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const StudentPerformance = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:performance");
  const printRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState<StudentPerformanceSummary[]>([]);
  const [detail, setDetail] = useState<StudentPerformanceDetail | null>(null);
  const [form, setForm] = useState<StudentPerformanceRecord | null>(null);
  const [physicalExams, setPhysicalExams] = useState<StudentExamMarkEntry[]>([]);
  const [writtenExams, setWrittenExams] = useState<StudentExamMarkEntry[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

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
      const student = students.find((item) => item.studentOnboardingId === studentOnboardingId);
      const cardType =
        data.performance.cardType || getCardTypeFromGender(student?.gender || data.student.gender);
      const nextForm = data.performance.hasRecord
        ? { ...recordToForm(data.performance as StudentPerformanceRecord), hasRecord: true }
        : {
            ...emptyPerformanceForm(studentOnboardingId, cardType, {
              studentId: data.student.studentId,
              fullName: data.student.fullName,
              batch: data.student.batch,
              gender: data.student.gender,
            }),
            hasRecord: false,
          };
      setDetail(data);
      setForm(nextForm);
      setPhysicalExams(data.physicalExams);
      setWrittenExams(data.writtenExams);
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
    setForm(null);
    setPhysicalExams([]);
    setWrittenExams([]);
    setError("");
  };

  const saveAll = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail || !form) return;
    setSaving(true);
    setError("");
    try {
      const suggested = suggestOverallPerformance(form.events);
      const payload = {
        ...form,
        overallPerformance: form.overallPerformance || suggested,
      };
      await api.saveStudentPerformance(form.studentOnboardingId, payload);

      const marks = [...physicalExams, ...writtenExams]
        .filter((exam) => exam.scoredMarks !== "" && exam.scoredMarks !== null && exam.scoredMarks !== undefined)
        .map((exam) => ({
          examId: exam.examId,
          scoredMarks: Number(exam.scoredMarks),
          remarks: exam.remarks || "",
        }));
      if (marks.length > 0) {
        await api.saveStudentExamMarks(form.studentOnboardingId, marks);
      }

      notify.success("Student performance saved.");
      await loadStudents();
      await openStudent(form.studentOnboardingId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save performance.";
      setError(message);
      notify.error(err, "Failed to save performance.");
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

      {!detail || !form ? (
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
                            View Performance
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

          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Attendance</p>
                  <h4 className="mb-0">{formatPercent(detail.summary.attendancePercent)}</h4>
                  <small className="text-muted">
                    {detail.summary.attendancePresent}/{detail.summary.attendanceTotal} days
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Physical Exam</p>
                  <h4 className="mb-0">{formatPercent(detail.summary.physicalExamPercent)}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Written Exam</p>
                  <h4 className="mb-0">{formatPercent(detail.summary.writtenExamPercent)}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Overall Performance</p>
                  <h4 className="mb-0">{formatPercent(detail.summary.overallPercent)}</h4>
                  {detail.summary.overallPerformance && (
                    <span className={`badge ${overallPerformanceBadgeClass(detail.summary.overallPerformance as never)}`}>
                      {overallPerformanceLabel(detail.summary.overallPerformance as never)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Attendance Performance</h5>
            </div>
            <div className="card-body">
              {detail.attendance.length === 0 ? (
                <p className="text-muted mb-0">No attendance records yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.attendance.map((item) => (
                        <tr key={item.date}>
                          <td>{item.date}</td>
                          <td className="text-capitalize">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <form onSubmit={saveAll}>
              <ExamMarksTable
                title="Physical Exam Performance"
                exams={physicalExams}
                onChange={setPhysicalExams}
              />
              <ExamMarksTable title="Written Exam Performance" exams={writtenExams} onChange={setWrittenExams} />

              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Physical Efficiency Record Card</h5>
                </div>
                <div className="card-body">
                  <PhysicalRecordCard form={form} onChange={setForm} />
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 spa-no-print">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save All Performance"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-info"
                  onClick={() => {
                    const suggested = suggestOverallPerformance(form.events);
                    if (suggested) setForm({ ...form, overallPerformance: suggested });
                  }}
                >
                  Auto-suggest overall rating
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default StudentPerformance;
