import { FormEvent, useContext, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_PERMISSION_KEYS,
  STAFF_ADMIN_PERMISSION_KEYS,
  STUDENT_PERMISSIONS,
  defaultPermissionsForRole,
  hasPermission,
} from "../permissions";
import { getPanelMotherMenu, formatAccountType } from "../panelLabels";
import { notify } from "../toast";
import type { ManagedUser, StaffType, Subject } from "../types";

type CreateAccountType = "student" | "admin" | "staff";

function PermissionChecklist({
  role,
  selected,
  onChange,
}: {
  role: CreateAccountType;
  selected: string[];
  onChange: (permissions: string[]) => void;
}) {
  const options =
    role === "student"
      ? STUDENT_PERMISSIONS
      : ADMIN_PERMISSIONS.filter((option) =>
          (role === "admin" ? ADMIN_ROLE_PERMISSION_KEYS : STAFF_ADMIN_PERMISSION_KEYS).includes(option.key)
        );

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      const next = selected.filter((item) => item !== key);
      onChange(next.length > 0 ? next : [key]);
      return;
    }
    onChange([...selected, key]);
  };

  return (
    <div className="spa-permission-list">
      {options.map((option) => (
        <label key={option.key} className="spa-permission-item">
          <input
            type="checkbox"
            className="form-check-input"
            checked={selected.includes(option.key)}
            onChange={() => toggle(option.key)}
          />
          <span>
            <strong>{option.label}</strong>
            <small className="d-block text-muted">{option.description}</small>
          </span>
        </label>
      ))}
    </div>
  );
}

function SubjectChecklist({
  subjects,
  selected,
  onChange,
}: {
  subjects: Subject[];
  selected: string[];
  onChange: (subjectIds: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
      return;
    }
    onChange([...selected, id]);
  };

  if (subjects.length === 0) {
    return (
      <p className="text-muted small mb-0">
        No subjects found. Add subjects under Master in the sidebar first.
      </p>
    );
  }

  return (
    <div className="spa-permission-list">
      {subjects.map((subject) => (
        <label key={subject.id} className="spa-permission-item">
          <input
            type="checkbox"
            className="form-check-input"
            checked={selected.includes(subject.id)}
            onChange={() => toggle(subject.id)}
          />
          <span>{subject.name}</span>
        </label>
      ))}
    </div>
  );
}

const UserManagement = () => {
  const { auth } = useContext(ThemeContext);
  const isSuperAdmin = auth?.role === "superadmin";
  const [admins, setAdmins] = useState<ManagedUser[]>([]);
  const [staff, setStaff] = useState<ManagedUser[]>([]);
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createAccountType, setCreateAccountType] = useState<CreateAccountType>("student");
  const [createPermissions, setCreatePermissions] = useState<string[]>(
    defaultPermissionsForRole("student")
  );
  const [createStaffType, setCreateStaffType] = useState<StaffType>("physical");
  const [createSubjectIds, setCreateSubjectIds] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editingProfileUser, setEditingProfileUser] = useState<ManagedUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editStaffType, setEditStaffType] = useState<StaffType>("physical");
  const [editSubjectIds, setEditSubjectIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    if (isSuperAdmin) {
      const [studentData, adminData, staffData, subjectData] = await Promise.all([
        api.getUsers("student"),
        api.getUsers("admin"),
        api.getUsers("staff"),
        api.getSubjects(),
      ]);
      setStudents(studentData);
      setAdmins(adminData);
      setStaff(staffData);
      setSubjects(subjectData.filter((subject) => subject.isActive));
      return;
    }
    const studentData = await api.getUsers("student");
    setStudents(studentData);
  };

  useEffect(() => {
    loadUsers().catch(console.error);
  }, [isSuperAdmin]);

  useEffect(() => {
    setCreatePermissions(defaultPermissionsForRole(createAccountType));
    if (createAccountType !== "staff") {
      setCreateStaffType("physical");
      setCreateSubjectIds([]);
    }
  }, [createAccountType]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (createAccountType === "staff" && createStaffType === "subject" && createSubjectIds.length === 0) {
        setError("Please select at least one subject for subject staff.");
        setLoading(false);
        return;
      }

      await api.createUser(
        name.trim(),
        email.trim(),
        password,
        createAccountType,
        createPermissions,
        createAccountType === "staff" ? createStaffType : undefined,
        createAccountType === "staff" && createStaffType === "subject" ? createSubjectIds : undefined
      );
      setName("");
      setEmail("");
      setPassword("");
      setCreateStaffType("physical");
      setCreateSubjectIds([]);
      setCreatePermissions(defaultPermissionsForRole(createAccountType));
      await loadUsers();
      notify.success("Account created successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      setError(message);
      notify.error(err, "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (user: ManagedUser) => {
    try {
      await api.setUserAccess(user.id, !user.isActive);
      await loadUsers();
      notify.success(user.isActive ? "Login access revoked." : "Login access granted.");
    } catch (err) {
      notify.error(err, "Failed to update login access");
    }
  };

  const openEditPermissions = (user: ManagedUser) => {
    setEditingUser(user);
    setEditPermissions(user.permissions);
  };

  const openEditProfile = (user: ManagedUser) => {
    setEditingProfileUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword("");
    setEditStaffType(user.staffType || "physical");
    setEditSubjectIds(user.subjectIds || []);
    setError("");
  };

  const saveEditProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingProfileUser) return;
    setLoading(true);
    setError("");
    try {
      const data: {
        name: string;
        email: string;
        password?: string;
        staffType?: StaffType;
        subjectIds?: string[];
      } = {
        name: editName.trim(),
        email: editEmail.trim(),
      };
      if (editPassword) {
        data.password = editPassword;
      }
      if (editingProfileUser.role === "staff") {
        if (editStaffType === "subject" && editSubjectIds.length === 0) {
          setError("Please select at least one subject for subject staff.");
          setLoading(false);
          return;
        }
        data.staffType = editStaffType;
        data.subjectIds = editStaffType === "subject" ? editSubjectIds : [];
      }
      await api.updateUser(editingProfileUser.id, data);
      setEditingProfileUser(null);
      await loadUsers();
      notify.success("Account updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update account";
      setError(message);
      notify.error(err, "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  const saveEditPermissions = async () => {
    if (!editingUser) return;
    setLoading(true);
    setError("");
    try {
      await api.updateUserPermissions(editingUser.id, editPermissions);
      setEditingUser(null);
      await loadUsers();
      notify.success("Permissions updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update permissions";
      setError(message);
      notify.error(err, "Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  const formatStaffType = (user: ManagedUser) => {
    if (user.role !== "staff") return "—";
    if (user.staffType === "physical") return "Physical Staff";
    if (user.staffType === "subject") {
      if (user.subjectNames?.length) {
        return `Subject Staff — ${user.subjectNames.join(", ")}`;
      }
      return "Subject Staff";
    }
    return "—";
  };

  const renderTable = (
    users: ManagedUser[],
    canManage: boolean,
    canEditPermissions: boolean,
    showStaffDetails = false
  ) => (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            {showStaffDetails && <th>Staff Type</th>}
            <th>Status</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={canManage ? (showStaffDetails ? 6 : 5) : showStaffDetails ? 5 : 4} className="text-muted text-center">
                No accounts yet.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className="badge bg-secondary">{formatAccountType(user.role)}</span>
                </td>
                {showStaffDetails && <td>{formatStaffType(user)}</td>}
                <td>
                  <span className={`badge ${user.isActive ? "bg-success" : "bg-warning"}`}>
                    {user.isActive ? "Active" : "Pending"}
                  </span>
                </td>
                {canManage && (
                  <td className="spa-user-actions-cell">
                    {user.role !== "superadmin" && (
                      <div className="spa-user-actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary spa-user-action-btn"
                          onClick={() => openEditProfile(user)}
                          title="Edit Account"
                          aria-label="Edit Account"
                        >
                          <i className="fas fa-pencil-alt" />
                        </button>
                        {canEditPermissions && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary spa-user-action-btn"
                            onClick={() => openEditPermissions(user)}
                            title="Edit Access"
                            aria-label="Edit Access"
                          >
                            <i className="fa fa-key" />
                          </button>
                        )}
                        <button
                          type="button"
                          className={`btn btn-sm spa-user-action-btn ${
                            user.isActive ? "btn-outline-warning" : "btn-outline-success"
                          }`}
                          onClick={() => toggleAccess(user)}
                          title={user.isActive ? "Revoke Login" : "Grant Login"}
                          aria-label={user.isActive ? "Revoke Login" : "Grant Login"}
                        >
                          <i className={`fa ${user.isActive ? "fa-ban" : "fa-unlock"}`} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger spa-user-action-btn"
                          onClick={async () => {
                            try {
                              await api.deleteUser(user.id);
                              await loadUsers();
                              notify.success("Account deleted successfully.");
                            } catch (err) {
                              notify.error(err, "Failed to delete account");
                            }
                          }}
                          title="Delete"
                          aria-label="Delete"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="User Management" pageContent="" />
      {!hasPermission(auth, "admin:users") ? (
        <div className="alert alert-warning">You do not have permission to manage users.</div>
      ) : (
        <>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-xl-5">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Create Account</h4>
            </div>
            <div className="card-body">
              <form onSubmit={onCreate}>
                {isSuperAdmin && (
                  <div className="mb-3">
                    <label className="form-label">Account Type</label>
                    <select
                      className="form-select"
                      value={createAccountType}
                      onChange={(e) => setCreateAccountType(e.target.value as CreateAccountType)}
                    >
                      <option value="student">Student (Student Panel)</option>
                      <option value="admin">Admin (Admin Panel)</option>
                      <option value="staff">Staff (Staff Panel)</option>
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {createAccountType === "staff" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Staff Type</label>
                      <select
                        className="form-select"
                        value={createStaffType}
                        onChange={(e) => {
                          const nextType = e.target.value as StaffType;
                          setCreateStaffType(nextType);
                          if (nextType === "physical") {
                            setCreateSubjectIds([]);
                          }
                        }}
                      >
                        <option value="physical">Physical Staff</option>
                        <option value="subject">Subject Staff</option>
                      </select>
                    </div>

                    {createStaffType === "subject" && (
                      <div className="mb-3">
                        <label className="form-label">Subjects</label>
                        <p className="text-muted small mb-2">
                          Select all subjects this staff will teach.
                        </p>
                        <SubjectChecklist
                          subjects={subjects}
                          selected={createSubjectIds}
                          onChange={setCreateSubjectIds}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label">Panel Permissions</label>
                  <p className="text-muted small mb-2">
                    Choose which sections this account can access after login is granted.
                  </p>
                  <PermissionChecklist
                    role={createAccountType}
                    selected={createPermissions}
                    onChange={setCreatePermissions}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </button>
                <p className="text-muted small mt-2 mb-0">
                  New accounts start with login access <strong>disabled</strong>. Use Grant Login
                  after reviewing permissions.
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="col-xl-7">
          {isSuperAdmin && (
            <div className="card mb-4">
              <div className="card-header">
                <h4 className="card-title mb-0">Admin Accounts</h4>
              </div>
              <div className="card-body">{renderTable(admins, true, true)}</div>
            </div>
          )}

          {isSuperAdmin && (
            <div className="card mb-4">
              <div className="card-header">
                <h4 className="card-title mb-0">Staff Accounts</h4>
              </div>
              <div className="card-body">{renderTable(staff, true, true, true)}</div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Student Accounts</h4>
            </div>
            <div className="card-body">{renderTable(students, true, true)}</div>
          </div>
        </div>
      </div>

      {editingProfileUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={saveEditProfile}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Account — {editingProfileUser.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingProfileUser(null)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                    />
                  </div>
                  {editingProfileUser.role === "staff" && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Staff Type</label>
                        <select
                          className="form-select"
                          value={editStaffType}
                          onChange={(e) => {
                            const nextType = e.target.value as StaffType;
                            setEditStaffType(nextType);
                            if (nextType === "physical") {
                              setEditSubjectIds([]);
                            }
                          }}
                        >
                          <option value="physical">Physical Staff</option>
                          <option value="subject">Subject Staff</option>
                        </select>
                      </div>
                      {editStaffType === "subject" && (
                        <div className="mb-3">
                          <label className="form-label">Subjects</label>
                          <p className="text-muted small mb-2">
                            Select all subjects this staff will teach.
                          </p>
                          <SubjectChecklist
                            subjects={subjects}
                            selected={editSubjectIds}
                            onChange={setEditSubjectIds}
                          />
                        </div>
                      )}
                    </>
                  )}
                  <div className="mb-0">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditingProfileUser(null)}
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

      {editingUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Access — {editingUser.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingUser(null)}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  Update which panel sections <strong>{editingUser.email}</strong> can use.
                </p>
                <PermissionChecklist
                  role={
                    editingUser.role === "student"
                      ? "student"
                      : editingUser.role === "staff"
                        ? "staff"
                        : "admin"
                  }
                  selected={editPermissions}
                  onChange={setEditPermissions}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={saveEditPermissions} disabled={loading}>
                  {loading ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </>
  );
};

export default UserManagement;
