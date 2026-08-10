import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import PhysicalRecordCard from "../shared/PhysicalRecordCard";
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

const StudentPerformance = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:performance");

  const [students, setStudents] = useState<StudentPerformanceSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentPerformanceRecord | null>(null);
  const [search, setSearch] = useState("");
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
    if (!query) return students;
    return students.filter((student) => {
      return (
        student.studentId.toLowerCase().includes(query) ||
        student.fullName.toLowerCase().includes(query) ||
        student.batch.toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  const selectedStudent = students.find((item) => item.studentOnboardingId === selectedStudentId) || null;

  const openStudent = async (studentOnboardingId: string) => {
    setLoading(true);
    setError("");
    try {
      const record = await api.getStudentPerformanceByStudent(studentOnboardingId);
      const student = students.find((item) => item.studentOnboardingId === studentOnboardingId);
      const cardType = record.cardType || getCardTypeFromGender(student?.gender);
      const nextForm = record.hasRecord
        ? { ...recordToForm(record), hasRecord: true }
        : {
            ...emptyPerformanceForm(studentOnboardingId, cardType, {
              studentId: student?.studentId || "",
              fullName: student?.fullName || "",
              batch: student?.batch || "",
              gender: student?.gender || "",
            }),
            hasRecord: false,
          };
      setForm(nextForm);
      setSelectedStudentId(studentOnboardingId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load performance record.";
      setError(message);
      notify.error(err, "Failed to load performance record.");
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setSelectedStudentId(null);
    setForm(null);
    setError("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const suggested = suggestOverallPerformance(form.events);
      const payload = {
        ...form,
        overallPerformance: form.overallPerformance || suggested,
      };
      await api.saveStudentPerformance(form.studentOnboardingId, payload);
      notify.success("Physical performance record saved.");
      await loadStudents();
      closeForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save performance record.";
      const hint =
        message.includes("404") || message.toLowerCase().includes("not found")
          ? " The performance API may not be deployed yet. Merge and deploy the latest backend update."
          : "";
      setError(message + hint);
      notify.error(err, "Failed to save performance record.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!form || !window.confirm("Delete this student's performance record?")) return;
    setSaving(true);
    try {
      await api.deleteStudentPerformance(form.studentOnboardingId);
      notify.success("Performance record deleted.");
      await loadStudents();
      closeForm();
    } catch (err) {
      notify.error(err, "Failed to delete performance record.");
    } finally {
      setSaving(false);
    }
  };

  const autoSuggestOverall = () => {
    if (!form) return;
    const suggested = suggestOverallPerformance(form.events);
    if (suggested) {
      setForm({ ...form, overallPerformance: suggested });
    }
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

      {!selectedStudentId || !form ? (
        <div className="card">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h4 className="card-title mb-0">Students — Physical Performance</h4>
            <input
              type="search"
              className="form-control form-control-sm"
              style={{ maxWidth: "280px" }}
              placeholder="Search by name, register no., batch..."
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
              <p className="text-muted mb-0">
                No students found. Add students via Student Onboarding first, then return here to record their
                physical performance.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Register No.</th>
                      <th>Student Name</th>
                      <th>Batch</th>
                      <th>Gender</th>
                      <th>Card Type</th>
                      <th>Overall Performance</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.studentOnboardingId}>
                        <td>{student.studentId}</td>
                        <td>{student.fullName}</td>
                        <td>{student.batch || "—"}</td>
                        <td>{student.gender || "—"}</td>
                        <td className="text-capitalize">{student.cardType}</td>
                        <td>
                          <span className={`badge ${overallPerformanceBadgeClass(student.overallPerformance)}`}>
                            {student.overallPerformance
                              ? overallPerformanceLabel(student.overallPerformance)
                              : "Not rated"}
                          </span>
                        </td>
                        <td>
                          {student.hasRecord ? (
                            <span className="badge badge-success">Recorded</span>
                          ) : (
                            <span className="badge badge-light text-dark">Pending</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => openStudent(student.studentOnboardingId)}
                          >
                            {student.hasRecord ? "View / Edit" : "Add Record"}
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
        <div className="card">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h4 className="card-title mb-0">
                {selectedStudent?.fullName} — Physical Record Card
              </h4>
              <small className="text-muted">
                {selectedStudent?.studentId} · Batch {selectedStudent?.batch || "—"}
              </small>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closeForm}>
                Back to list
              </button>
              {form.hasRecord && (
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={onDelete} disabled={saving}>
                  Delete
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
              <p className="text-muted mb-0">Loading performance record...</p>
            ) : (
              <form onSubmit={onSubmit}>
                <PhysicalRecordCard form={form} onChange={setForm} />
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button type="button" className="btn btn-outline-info" onClick={autoSuggestOverall}>
                    Auto-suggest overall rating
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Performance Record"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StudentPerformance;
