import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import type { StudentProfile, StudentRecord } from "../types";

const emptyProfile = (): StudentProfile => ({
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  guardianName: "",
  guardianPhone: "",
  enrollmentNumber: "",
  batch: "",
  course: "",
  enrollmentDate: "",
  remarks: "",
});

type FormState = {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  profile: StudentProfile;
};

const emptyForm = (): FormState => ({
  name: "",
  email: "",
  password: "",
  isActive: false,
  profile: emptyProfile(),
});

const StudentOnboarding = () => {
  const { auth } = useContext(ThemeContext);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const loadStudents = async () => {
    const data = await api.getStudents();
    setStudents(data);
  };

  useEffect(() => {
    loadStudents().catch(console.error);
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) => {
      const { profile } = student;
      return (
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        profile.phone.toLowerCase().includes(query) ||
        profile.enrollmentNumber.toLowerCase().includes(query) ||
        profile.batch.toLowerCase().includes(query) ||
        profile.course.toLowerCase().includes(query) ||
        profile.guardianName.toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  const openCreate = () => {
    setEditingStudent(null);
    setForm(emptyForm());
    setError("");
    setShowForm(true);
  };

  const openEdit = (student: StudentRecord) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      email: student.email,
      password: "",
      isActive: student.isActive,
      profile: { ...student.profile },
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStudent(null);
    setForm(emptyForm());
    setError("");
  };

  const updateProfile = (field: keyof StudentProfile, value: string) => {
    setForm((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingStudent) {
        const payload: {
          name: string;
          email: string;
          isActive: boolean;
          profile: StudentProfile;
          password?: string;
        } = {
          name: form.name.trim(),
          email: form.email.trim(),
          isActive: form.isActive,
          profile: form.profile,
        };

        if (form.password.trim()) {
          payload.password = form.password.trim();
        }

        await api.updateStudent(editingStudent.id, payload);
      } else {
        if (!form.password.trim()) {
          setError("Password is required for new students.");
          setLoading(false);
          return;
        }

        await api.createStudent(
          form.name.trim(),
          form.email.trim(),
          form.password.trim(),
          form.profile
        );
      }

      await loadStudents();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (student: StudentRecord) => {
    if (!window.confirm(`Delete student ${student.name}? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.deleteStudent(student.id);
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (student: StudentRecord) => {
    setLoading(true);
    setError("");
    try {
      await api.updateStudent(student.id, { isActive: !student.isActive });
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update student access");
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission(auth, "admin:onboarding")) {
    return (
      <>
        <PageTitle motherMenu="Admin Panel" activeMenu="Student Onboarding" pageContent="" />
        <div className="alert alert-warning">You do not have permission to manage student onboarding.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu="Admin Panel" activeMenu="Student Onboarding" pageContent="" />

      {error && !showForm && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="card-title mb-0">Student Records</h4>
          <div className="d-flex flex-wrap gap-2">
            <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Search name, email, batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: 220 }}
            />
            <button type="button" className="btn btn-sm btn-primary" onClick={openCreate}>
              <i className="fa fa-plus me-1" />
              Add Student
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Enrollment No.</th>
                  <th>Batch</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-muted text-center">
                      {students.length === 0 ? "No students onboarded yet." : "No students match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.profile.phone || "—"}</td>
                      <td>{student.profile.enrollmentNumber || "—"}</td>
                      <td>{student.profile.batch || "—"}</td>
                      <td>{student.profile.course || "—"}</td>
                      <td>
                        <span className={`badge ${student.isActive ? "bg-success" : "bg-warning"}`}>
                          {student.isActive ? "Active" : "Pending"}
                        </span>
                      </td>
                      <td className="spa-user-actions-cell">
                        <div className="spa-user-actions">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary spa-user-action-btn"
                            onClick={() => openEdit(student)}
                            title="Edit"
                            aria-label="Edit"
                          >
                            <i className="fa fa-pencil" />
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm spa-user-action-btn ${
                              student.isActive ? "btn-outline-warning" : "btn-outline-success"
                            }`}
                            onClick={() => toggleAccess(student)}
                            title={student.isActive ? "Revoke Login" : "Grant Login"}
                            aria-label={student.isActive ? "Revoke Login" : "Grant Login"}
                          >
                            <i className={`fa ${student.isActive ? "fa-ban" : "fa-unlock"}`} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger spa-user-action-btn"
                            onClick={() => onDelete(student)}
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

      {showForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <form onSubmit={onSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingStudent ? `Edit Student — ${editingStudent.name}` : "Add Student"}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeForm} aria-label="Close" />
                </div>
                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}

                  <h6 className="mb-3">Account Details</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Password {editingStudent && <span className="text-muted">(leave blank to keep)</span>}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={form.password}
                        onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                        required={!editingStudent}
                      />
                    </div>
                    {editingStudent && (
                      <div className="col-md-6 d-flex align-items-end">
                        <div className="form-check">
                          <input
                            id="student-active"
                            type="checkbox"
                            className="form-check-input"
                            checked={form.isActive}
                            onChange={(e) =>
                              setForm((current) => ({ ...current, isActive: e.target.checked }))
                            }
                          />
                          <label className="form-check-label" htmlFor="student-active">
                            Login access enabled
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <h6 className="mb-3">Personal Details</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        value={form.profile.phone}
                        onChange={(e) => updateProfile("phone", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.profile.dateOfBirth}
                        onChange={(e) => updateProfile("dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        value={form.profile.gender}
                        onChange={(e) => updateProfile("gender", e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={form.profile.address}
                        onChange={(e) => updateProfile("address", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">City</label>
                      <input
                        className="form-control"
                        value={form.profile.city}
                        onChange={(e) => updateProfile("city", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">State</label>
                      <input
                        className="form-control"
                        value={form.profile.state}
                        onChange={(e) => updateProfile("state", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Pincode</label>
                      <input
                        className="form-control"
                        value={form.profile.pincode}
                        onChange={(e) => updateProfile("pincode", e.target.value)}
                      />
                    </div>
                  </div>

                  <h6 className="mb-3">Guardian Details</h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Guardian Name</label>
                      <input
                        className="form-control"
                        value={form.profile.guardianName}
                        onChange={(e) => updateProfile("guardianName", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Guardian Phone</label>
                      <input
                        className="form-control"
                        value={form.profile.guardianPhone}
                        onChange={(e) => updateProfile("guardianPhone", e.target.value)}
                      />
                    </div>
                  </div>

                  <h6 className="mb-3">Academy Details</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Enrollment Number</label>
                      <input
                        className="form-control"
                        value={form.profile.enrollmentNumber}
                        onChange={(e) => updateProfile("enrollmentNumber", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Batch</label>
                      <input
                        className="form-control"
                        value={form.profile.batch}
                        onChange={(e) => updateProfile("batch", e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Course</label>
                      <input
                        className="form-control"
                        value={form.profile.course}
                        onChange={(e) => updateProfile("course", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Enrollment Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.profile.enrollmentDate}
                        onChange={(e) => updateProfile("enrollmentDate", e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={form.profile.remarks}
                        onChange={(e) => updateProfile("remarks", e.target.value)}
                      />
                    </div>
                  </div>

                  {!editingStudent && (
                    <p className="text-muted small mt-3 mb-0">
                      New students start with login access <strong>disabled</strong>. Grant access from
                      the table after reviewing details.
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : editingStudent ? "Save Changes" : "Add Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentOnboarding;
