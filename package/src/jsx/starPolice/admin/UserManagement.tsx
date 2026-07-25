import { FormEvent, useContext, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import type { ManagedUser } from "../types";

const UserManagement = () => {
  const { auth } = useContext(ThemeContext);
  const isSuperAdmin = auth?.role === "superadmin";
  const [admins, setAdmins] = useState<ManagedUser[]>([]);
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createRole, setCreateRole] = useState<"admin" | "student">("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const studentData = await api.getUsers("student");
    setStudents(studentData);
    if (isSuperAdmin) {
      const adminData = await api.getUsers("admin");
      setAdmins(adminData);
    }
  };

  useEffect(() => {
    loadUsers().catch(console.error);
  }, [isSuperAdmin]);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createUser(name.trim(), email.trim(), password, createRole);
      setName("");
      setEmail("");
      setPassword("");
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

  const renderTable = (users: ManagedUser[], canManage: boolean) => (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Panel Access</th>
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
                  <span className="badge bg-secondary text-uppercase">{user.role}</span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? "bg-success" : "bg-warning"}`}>
                    {user.isActive ? "Active" : "Pending"}
                  </span>
                </td>
                {canManage && (
                  <td>
                    {user.role !== "superadmin" && (
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={`btn btn-sm ${user.isActive ? "btn-outline-warning" : "btn-outline-success"}`}
                          onClick={() => toggleAccess(user)}
                        >
                          {user.isActive ? "Revoke Login" : "Grant Login"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={async () => {
                            await api.deleteUser(user.id);
                            await loadUsers();
                          }}
                        >
                          Delete
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
      <PageTitle motherMenu="Admin Panel" activeMenu="User Management" pageContent="" />
      {!hasPermission(auth, "admin:users") ? (
        <div className="alert alert-warning">You do not have permission to manage users.</div>
      ) : (
        <>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row">
            <div className="col-xl-4">
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
                          value={createRole}
                          onChange={(e) => setCreateRole(e.target.value as "admin" | "student")}
                        >
                          <option value="student">Student (Student Panel)</option>
                          <option value="admin">Admin (Admin Panel)</option>
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

                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? "Creating..." : "Create Account"}
                    </button>
                    <p className="text-muted small mt-2 mb-0">
                      New accounts start with login access <strong>disabled</strong>. Use Grant Login
                      when the account is ready.
                    </p>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-xl-8">
              {isSuperAdmin && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h4 className="card-title mb-0">Admin Accounts</h4>
                  </div>
                  <div className="card-body">{renderTable(admins, true)}</div>
                </div>
              )}

              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Student Accounts</h4>
                </div>
                <div className="card-body">{renderTable(students, true)}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserManagement;
