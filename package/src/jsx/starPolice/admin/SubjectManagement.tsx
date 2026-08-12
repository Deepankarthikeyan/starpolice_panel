import { FormEvent, useContext, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import type { Subject } from "../types";

const SubjectManagement = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:master");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState("");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadSubjects = async () => {
    const data = await api.getSubjects();
    setSubjects(data);
  };

  useEffect(() => {
    if (!canManage) return;
    loadSubjects().catch(console.error);
  }, [canManage]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createSubject(name.trim());
      setName("");
      await loadSubjects();
      notify.success("Subject added successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add subject";
      setError(message);
      notify.error(err, "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setEditName(subject.name);
    setError("");
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingSubject) return;
    setLoading(true);
    setError("");
    try {
      await api.updateSubject(editingSubject.id, { name: editName.trim() });
      setEditingSubject(null);
      await loadSubjects();
      notify.success("Subject updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update subject";
      setError(message);
      notify.error(err, "Failed to update subject");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (subject: Subject) => {
    try {
      await api.updateSubject(subject.id, { isActive: !subject.isActive });
      await loadSubjects();
      notify.success(subject.isActive ? "Subject deactivated." : "Subject activated.");
    } catch (err) {
      notify.error(err, "Failed to update subject status");
    }
  };

  const deleteSubject = async (subject: Subject) => {
    try {
      await api.deleteSubject(subject.id);
      await loadSubjects();
      notify.success("Subject deleted successfully.");
    } catch (err) {
      notify.error(err, "Failed to delete subject");
    }
  };

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Master — Subjects" pageContent="" />
      {!canManage ? (
        <div className="alert alert-warning">You do not have permission to manage master data.</div>
      ) : (
        <>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row">
            <div className="col-xl-4">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Add Subject</h4>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-3">
                    Add subjects such as Chemistry, Physics, Mathematics, etc. Subject staff can be
                    assigned to these when creating staff accounts.
                  </p>
                  <form onSubmit={onCreate}>
                    <div className="mb-3">
                      <label className="form-label">Subject Name</label>
                      <input
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Chemistry"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? "Adding..." : "Add Subject"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-xl-8">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Subjects</h4>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped align-middle">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-muted text-center">
                              No subjects yet. Add your first subject on the left.
                            </td>
                          </tr>
                        ) : (
                          subjects.map((subject) => (
                            <tr key={subject.id}>
                              <td>{subject.name}</td>
                              <td>
                                <span
                                  className={`badge ${subject.isActive ? "bg-success" : "bg-secondary"}`}
                                >
                                  {subject.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="spa-user-actions-cell">
                                <div className="spa-user-actions">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary spa-user-action-btn"
                                    onClick={() => openEdit(subject)}
                                    title="Edit"
                                    aria-label="Edit"
                                  >
                                    <i className="fas fa-pencil-alt" />
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm spa-user-action-btn ${
                                      subject.isActive ? "btn-outline-warning" : "btn-outline-success"
                                    }`}
                                    onClick={() => toggleActive(subject)}
                                    title={subject.isActive ? "Deactivate" : "Activate"}
                                    aria-label={subject.isActive ? "Deactivate" : "Activate"}
                                  >
                                    <i className={`fa ${subject.isActive ? "fa-ban" : "fa-check"}`} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger spa-user-action-btn"
                                    onClick={() => deleteSubject(subject)}
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

          {editingSubject && (
            <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <form onSubmit={saveEdit}>
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Subject</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setEditingSubject(null)}
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body">
                      <div className="mb-0">
                        <label className="form-label">Subject Name</label>
                        <input
                          className="form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setEditingSubject(null)}
                      >
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

export default SubjectManagement;
