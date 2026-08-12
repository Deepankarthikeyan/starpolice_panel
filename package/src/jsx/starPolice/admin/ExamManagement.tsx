import { FormEvent, useContext, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import type { Subject } from "../types";
import {
  EXAM_TYPE_OPTIONS,
  examTypeLabel,
  emptyExamForm,
  type Exam,
  type ExamType,
} from "./examDefaults";

const ExamManagement = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:master");

  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState(emptyExamForm());
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editName, setEditName] = useState("");
  const [editExamType, setEditExamType] = useState<ExamType>("written_exam");
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editTotalMarks, setEditTotalMarks] = useState("100");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [examData, subjectData] = await Promise.all([api.getExams(), api.getSubjects()]);
    const activeSubjects = subjectData.filter((subject) => subject.isActive);
    setExams(examData);
    setSubjects(activeSubjects);
    setForm((prev) => ({
      ...prev,
      subjectId: prev.subjectId || activeSubjects[0]?.id || "",
    }));
  };

  useEffect(() => {
    if (!canManage) return;
    loadData().catch(console.error);
  }, [canManage]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createExam({
        name: form.name.trim(),
        examType: form.examType,
        subjectId: form.subjectId || null,
        totalMarks: Number(form.totalMarks),
      });
      setForm(emptyExamForm(subjects));
      await loadData();
      notify.success("Exam added successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add exam";
      setError(message);
      notify.error(err, "Failed to add exam");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (exam: Exam) => {
    setEditingExam(exam);
    setEditName(exam.name);
    setEditExamType(exam.examType);
    setEditSubjectId(exam.subjectId || "");
    setEditTotalMarks(String(exam.totalMarks));
    setError("");
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingExam) return;
    setLoading(true);
    setError("");
    try {
      await api.updateExam(editingExam.id, {
        name: editName.trim(),
        examType: editExamType,
        subjectId: editSubjectId || null,
        totalMarks: Number(editTotalMarks),
      });
      setEditingExam(null);
      await loadData();
      notify.success("Exam updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update exam";
      setError(message);
      notify.error(err, "Failed to update exam");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (exam: Exam) => {
    try {
      await api.updateExam(exam.id, { isActive: !exam.isActive });
      await loadData();
      notify.success(exam.isActive ? "Exam deactivated." : "Exam activated.");
    } catch (err) {
      notify.error(err, "Failed to update exam status");
    }
  };

  const deleteExam = async (exam: Exam) => {
    try {
      await api.deleteExam(exam.id);
      await loadData();
      notify.success("Exam deleted successfully.");
    } catch (err) {
      notify.error(err, "Failed to delete exam");
    }
  };

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Master — Exams" pageContent="" />
      {!canManage ? (
        <div className="alert alert-warning">You do not have permission to manage master data.</div>
      ) : (
        <>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row">
            <div className="col-xl-4">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Add Exam</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={onCreate}>
                    <div className="mb-3">
                      <label className="form-label">Exam Type</label>
                      <select
                        className="form-select"
                        value={form.examType}
                        onChange={(e) => setForm({ ...form, examType: e.target.value as ExamType })}
                      >
                        {EXAM_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Exam Name</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Physics Mark Exam 1"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Subject</label>
                      <select
                        className="form-select"
                        value={form.subjectId}
                        onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                      >
                        <option value="">No subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Total Marks (Out of)</label>
                      <input
                        type="number"
                        min={1}
                        className="form-control"
                        value={form.totalMarks}
                        onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? "Adding..." : "Add Exam"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-xl-8">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Exams</h4>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped align-middle">
                      <thead>
                        <tr>
                          <th>Exam</th>
                          <th>Type</th>
                          <th>Subject</th>
                          <th>Total Marks</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-muted text-center">
                              No exams yet. Add physical or written exams on the left.
                            </td>
                          </tr>
                        ) : (
                          exams.map((exam) => (
                            <tr key={exam.id}>
                              <td>{exam.name}</td>
                              <td>{examTypeLabel(exam.examType)}</td>
                              <td>{exam.subjectName || "—"}</td>
                              <td>{exam.totalMarks}</td>
                              <td>
                                <span className={`badge ${exam.isActive ? "bg-success" : "bg-secondary"}`}>
                                  {exam.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="spa-user-actions-cell">
                                <div className="spa-user-actions">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary spa-user-action-btn"
                                    onClick={() => openEdit(exam)}
                                    title="Edit"
                                    aria-label="Edit"
                                  >
                                    <i className="fas fa-pencil-alt" />
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm spa-user-action-btn ${
                                      exam.isActive ? "btn-outline-warning" : "btn-outline-success"
                                    }`}
                                    onClick={() => toggleActive(exam)}
                                    title={exam.isActive ? "Deactivate" : "Activate"}
                                    aria-label={exam.isActive ? "Deactivate" : "Activate"}
                                  >
                                    <i className={`fa ${exam.isActive ? "fa-ban" : "fa-check"}`} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger spa-user-action-btn"
                                    onClick={() => deleteExam(exam)}
                                    title="Delete"
                                    aria-label="Delete"
                                  >
                                    <i className="fa fa-trash" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {editingExam && (
            <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <form onSubmit={saveEdit}>
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Exam</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setEditingExam(null)}
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Exam Type</label>
                        <select
                          className="form-select"
                          value={editExamType}
                          onChange={(e) => setEditExamType(e.target.value as ExamType)}
                        >
                          {EXAM_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Exam Name</label>
                        <input className="form-control" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Subject</label>
                        <select
                          className="form-select"
                          value={editSubjectId}
                          onChange={(e) => setEditSubjectId(e.target.value)}
                        >
                          <option value="">No subject</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Total Marks (Out of)</label>
                        <input
                          type="number"
                          min={1}
                          className="form-control"
                          value={editTotalMarks}
                          onChange={(e) => setEditTotalMarks(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingExam(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ExamManagement;
