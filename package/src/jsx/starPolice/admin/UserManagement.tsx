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
import type { ManagedUser, Subject } from "../types";
import { SubjectMultiSelect } from "./SubjectMultiSelect";
import { PasswordInput } from "../shared/PasswordInput";
import { validateEmailOrThrow } from "../emailValidation";
import { EmailDeliveryNotice } from "../../pages/auth/EmailDeliveryNotice";

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

const UserManagement = () => {
  const { auth } = useContext(ThemeContext);
  const isSuperAdmin = auth?.role === "superadmin";
  const [admins, setAdmins] = useState<ManagedUser[]>([]);
  const [staff, setStaff] = useState<ManagedUser[]>([]);
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createAccountType, setCreateAccountType] = useState<CreateAccountType>("student");
  const [createPermissions, setCreatePermissions] = useState<string[]>(
    defaultPermissionsForRole("student")
  );
  const [createSubjectIds, setCreateSubjectIds] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editingProfileUser, setEditingProfileUser] = useState<ManagedUser | null>(null);
  const [editingSubjectsUser, setEditingSubjectsUser] = useState<ManagedUser | null>(null);
  const [subjectsSelectedIds, setSubjectsSelectedIds] = useState<string[]>([]);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<{
    message: string;
    setupUrl?: string;
    devMode?: boolean;
    delivered?: boolean;
  } | null>(null);

  const refreshSubjects = async () => {
    const subjectData = await api.getSubjects();
    setSubjects(subjectData.filter((subject) => subject.isActive));
  };

  const loadUsers = async () => {
    if (isSuperAdmin) {
      const [studentData, adminData, staffData] = await Promise.all([
        api.getUsers("student"),
        api.getUsers("admin"),
        api.getUsers("staff"),
      ]);
      setStudents(studentData);
      setAdmins(adminData);
      setStaff(staffData);
      await refreshSubjects();
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
      setCreateSubjectIds([]);
      return;
    }
    refreshSubjects().catch(console.error);
  }, [createAccountType]);

  useEffect(() => {
    if (!inviteNotice) return;
    if (inviteNotice.devMode && inviteNotice.setupUrl) return;

    const timer = window.setTimeout(() => setInviteNotice(null), 3000);
    return () => window.clearTimeout(timer);
  }, [inviteNotice]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInviteNotice(null);
    try {
      if (createAccountType === "staff" && createSubjectIds.length === 0) {
        setError("Please select at least one subject for this staff member.");
        setLoading(false);
        return;
      }

      try {
        validateEmailOrThrow(email);
      } catch (validationError) {
        const message =
          validationError instanceof Error
            ? validationError.message
            : "Please enter a valid email address.";
        setError(message);
        notify.error(message);
        setLoading(false);
        return;
      }

      const result = await api.createUser(
        name.trim(),
        email.trim(),
        createAccountType,
        createPermissions,
        createAccountType === "staff" ? createSubjectIds : undefined
      );
      setName("");
      setEmail("");
      setCreateSubjectIds([]);
      setCreatePermissions(defaultPermissionsForRole(createAccountType));
      await loadUsers();
      setInviteNotice({
        message: result.message || "Account created.",
        setupUrl: result.setupUrl,
        devMode: result.devMode,
        delivered: result.delivered,
      });
      notify.success(result.message || "Account created.");
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

  const resendInvite = async (user: ManagedUser) => {
    try {
      const result = await api.resendInvite(user.id);
      setInviteNotice({
        message: result.message,
        setupUrl: result.setupUrl,
        devMode: result.devMode,
        delivered: result.delivered,
      });
      notify.success(result.message);
    } catch (err) {
      notify.error(err, "Failed to send invite email");
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
    setError("");
  };

  const openEditSubjects = async (user: ManagedUser) => {
    await refreshSubjects();
    setEditingSubjectsUser(user);
    setSubjectsSelectedIds(user.subjectIds || []);
    setError("");
  };

  const saveEditSubjects = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingSubjectsUser) return;
    setLoading(true);
    setError("");
    try {
      if (subjectsSelectedIds.length === 0) {
        setError("Please select at least one subject for this staff member.");
        setLoading(false);
        return;
      }

      await api.updateUser(editingSubjectsUser.id, {
        subjectIds: subjectsSelectedIds,
      });
      setEditingSubjectsUser(null);
      await loadUsers();
      notify.success("Staff subjects updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update staff subjects";
      setError(message);
      notify.error(err, "Failed to update staff subjects");
    } finally {
      setLoading(false);
    }
  };

  const saveEditProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingProfileUser) return;
    setLoading(true);
    setError("");
    try {
      const data: { name: string; email: string; password?: string } = {
        name: editName.trim(),
        email: editEmail.trim(),
      };
      if (editPassword) {
        data.password = editPassword;
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

  const formatStaffSubjects = (user: ManagedUser) => {
    if (user.role !== "staff") return "—";
    if (user.subjectNames?.length) {
      return user.subjectNames.join(", ");
    }
    return "No subjects assigned";
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
            {showStaffDetails && <th>Subjects</th>}
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
                {showStaffDetails && <td>{formatStaffSubjects(user)}</td>}
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
                        {showStaffDetails && user.role === "staff" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary spa-user-action-btn"
                            onClick={() => openEditSubjects(user)}
                            title="Edit Subjects"
                            aria-label="Edit Subjects"
                          >
                            <i className="fa fa-book" />
                          </button>
                        )}
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
                        {!user.isActive && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info spa-user-action-btn"
                            onClick={() => resendInvite(user)}
                            title="Resend Invite Email"
                            aria-label="Resend Invite Email"
                          >
                            <i className="fa fa-envelope" />
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
              {inviteNotice && (
                <div className="mb-3">
                  <div
                    className={`alert py-2 small mb-2 ${
                      inviteNotice.delivered ? "alert-success" : "alert-warning"
                    }`}
                  >
                    {inviteNotice.message}
                  </div>
                  {inviteNotice.devMode && inviteNotice.setupUrl && (
                    <EmailDeliveryNotice
                      devMode={inviteNotice.devMode}
                      setupUrl={inviteNotice.setupUrl}
                      delivered={inviteNotice.delivered}
                    />
                  )}
                </div>
              )}
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
                  <p className="text-muted small mt-1 mb-0">
                    An invite email will be sent to set the password and activate panel access.
                  </p>
                </div>

                {createAccountType === "staff" && (
                  <div className="mb-3">
                    <label className="form-label">Subjects</label>
                    <p className="text-muted small mb-2">
                      Select the subjects this staff member can manage in the staff panel.
                    </p>
                    <SubjectMultiSelect
                      name="create-staff-subjects"
                      subjects={subjects}
                      selectedIds={createSubjectIds}
                      onChange={setCreateSubjectIds}
                    />
                  </div>
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
                  The user receives an email link to create their password and verify with a code.
                  Panel access is activated after they complete that step.
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
                  <div className="mb-0">
                    <label className="form-label">New Password</label>
                    <PasswordInput
                      value={editPassword}
                      onChange={setEditPassword}
                      placeholder="Leave blank to keep current password"
                      autoComplete="new-password"
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

      {editingSubjectsUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={saveEditSubjects}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Subjects — {editingSubjectsUser.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditingSubjectsUser(null)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-0">
                    <label className="form-label">Subjects</label>
                    <p className="text-muted small mb-2">
                      Update which subjects this staff member can access in the staff panel.
                    </p>
                    <SubjectMultiSelect
                      name="edit-staff-subjects"
                      subjects={subjects}
                      selectedIds={subjectsSelectedIds}
                      onChange={setSubjectsSelectedIds}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditingSubjectsUser(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Subjects"}
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
