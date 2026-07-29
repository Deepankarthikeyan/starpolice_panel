import { FormEvent, useContext, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import {
  ADMIN_PERMISSIONS,
  STAFF_ADMIN_PERMISSION_KEYS,
  STUDENT_PERMISSIONS,
  defaultPermissionsForRole,
  hasPermission,
} from "../permissions";
import { getPanelMotherMenu, formatAccountType } from "../panelLabels";
import type { ManagedUser } from "../types";

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
      : ADMIN_PERMISSIONS.filter((option) => STAFF_ADMIN_PERMISSION_KEYS.includes(option.key));

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
  const [password, setPassword] = useState("");
  const [createAccountType, setCreateAccountType] = useState<CreateAccountType>("student");
  const [createPermissions, setCreatePermissions] = useState<string[]>(
    defaultPermissionsForRole("student")
  );
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  }, [createAccountType]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createUser(name.trim(), email.trim(), password, createAccountType, createPermissions);
      setName("");
      setEmail("");
      setPassword("");
      setCreatePermissions(defaultPermissionsForRole(createAccountType));
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (user: ManagedUser) => {
    await api.setUserAccess(user.id, !user.isActive);
    await loadUsers();
  };

  const openEditPermissions = (user: ManagedUser) => {
    setEditingUser(user);
    setEditPermissions(user.permissions);
  };

  const saveEditPermissions = async () => {
    if (!editingUser) return;
    setLoading(true);
    setError("");
    try {
      await api.updateUserPermissions(editingUser.id, editPermissions);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (users: ManagedUser[], canManage: boolean, canEditPermissions: boolean) => (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={canManage ? 5 : 4} className="text-muted text-center">
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
                <td>
                  <span className={`badge ${user.isActive ? "bg-success" : "bg-warning"}`}>
                    {user.isActive ? "Active" : "Pending"}
                  </span>
                </td>
                {canManage && (
                  <td className="spa-user-actions-cell">
                    {user.role !== "superadmin" && (
                      <div className="spa-user-actions">
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
                            await api.deleteUser(user.id);
                            await loadUsers();
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
              <div className="card-body">{renderTable(staff, true, true)}</div>
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
