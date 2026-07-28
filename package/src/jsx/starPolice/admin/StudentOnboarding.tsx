import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import {
  buildFullName,
  emptyStudentProfile,
  type DocumentField,
} from "../studentProfile";
import type { StudentRecord } from "../types";
import StudentOnboardingForm from "./StudentOnboardingForm";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
  isActive: boolean;
  profile: ReturnType<typeof emptyStudentProfile>;
};

const emptyForm = (): FormState => ({
  email: "",
  password: "",
  confirmPassword: "",
  isActive: false,
  profile: emptyStudentProfile(),
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
  const [pendingFiles, setPendingFiles] = useState<Partial<Record<DocumentField, File>>>({});

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
      const fullName = buildFullName(profile).toLowerCase();
      return (
        fullName.includes(query) ||
        student.email.toLowerCase().includes(query) ||
        profile.studentId.toLowerCase().includes(query) ||
        profile.mobileNumber.toLowerCase().includes(query) ||
        profile.batch.toLowerCase().includes(query) ||
        profile.course.toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  const openCreate = () => {
    setEditingStudent(null);
    setForm(emptyForm());
    setPendingFiles({});
    setError("");
    setShowForm(true);
  };

  const openEdit = (student: StudentRecord) => {
    setEditingStudent(student);
    setForm({
      email: student.email,
      password: "",
      confirmPassword: "",
      isActive: student.isActive,
      profile: { ...student.profile, documents: { ...student.profile.documents } },
    });
    setPendingFiles({});
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStudent(null);
    setForm(emptyForm());
    setPendingFiles({});
    setError("");
  };

  const uploadPendingFiles = async (studentId: string) => {
    const entries = Object.entries(pendingFiles).filter(([, file]) => Boolean(file)) as Array<
      [DocumentField, File]
    >;

    for (const [field, file] of entries) {
      await api.uploadStudentFile(studentId, field, file);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!form.profile.firstName.trim() || !form.profile.lastName.trim()) {
        setError("First name and last name are required.");
        setLoading(false);
        return;
      }

      if (!editingStudent && form.password !== form.confirmPassword) {
        setError("Password and confirm password do not match.");
        setLoading(false);
        return;
      }

      if (editingStudent && form.password && form.password !== form.confirmPassword) {
        setError("Password and confirm password do not match.");
        setLoading(false);
        return;
      }

      let studentId = editingStudent?.id;

      if (editingStudent) {
        const payload: {
          email: string;
          isActive: boolean;
          profile: typeof form.profile;
          password?: string;
        } = {
          email: form.email.trim(),
          isActive: form.isActive,
          profile: form.profile,
        };

        if (form.password.trim()) {
          payload.password = form.password.trim();
        }

        await api.updateStudent(editingStudent.id, payload);
      } else {
        const created = await api.createStudent(
          form.email.trim(),
          form.password.trim(),
          form.profile
        );
        studentId = created.id;
      }

      if (studentId && Object.keys(pendingFiles).length > 0) {
        await uploadPendingFiles(studentId);
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
    if (!window.confirm(`Delete student ${buildFullName(student.profile)}? This cannot be undone.`)) {
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

  if (showForm) {
    return (
      <>
        <PageTitle motherMenu="Admin Panel" activeMenu="Student Onboarding" pageContent="" />
        <StudentOnboardingForm
          form={form}
          setForm={setForm}
          editing={Boolean(editingStudent)}
          loading={loading}
          error={error}
          pendingFiles={pendingFiles}
          onPendingFile={(field, file) => {
            setPendingFiles((current) => {
              const next = { ...current };
              if (file) {
                next[field] = file;
              } else {
                delete next[field];
              }
              return next;
            });
          }}
          onSubmit={onSubmit}
          onCancel={closeForm}
        />
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu="Admin Panel" activeMenu="Student Onboarding" pageContent="" />

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="card-title mb-0">Student Records</h4>
          <div className="d-flex flex-wrap gap-2">
            <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Search ID, name, email, batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: 240 }}
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
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Course</th>
                  <th>Batch</th>
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
                      <td>{student.profile.studentId || "—"}</td>
                      <td>{buildFullName(student.profile)}</td>
                      <td>{student.email}</td>
                      <td>{student.profile.mobileNumber || "—"}</td>
                      <td>{student.profile.course || "—"}</td>
                      <td>{student.profile.batch || "—"}</td>
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
    </>
  );
};

export default StudentOnboarding;
