import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { PasswordInput } from "../../starPolice/shared/PasswordInput";
import { api, storeAuth } from "../../starPolice/api";
import { notify } from "../../starPolice/toast";
import type { AuthUser } from "../../starPolice/types";

interface Props {
  setAuth: (auth: AuthUser) => void;
}

const AdminSignup = ({ setAuth }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSuperAdmin, setNeedsSuperAdmin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getSetupStatus().then((status) => setNeedsSuperAdmin(status.needsSuperAdmin)).catch(console.error);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await api.register(name, email, password, "admin");
      storeAuth(user);
      setAuth(user);
      notify.success("Super admin account created successfully.");
      navigate("/admin/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
      notify.error(err, "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (!needsSuperAdmin) {
    return (
      <AuthLayout
        panel="admin"
        title="Signup Closed"
        subtitle="A super admin already exists. Ask them to create your admin account."
        footer={
          <p className="text-center mt-3 mb-0">
            <Link to="/admin/login" className="spa-auth-link">
              Back to Admin Login
            </Link>
          </p>
        }
      >
        <div className="alert alert-info">
          Admin accounts are created by the super admin from User Management after login.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      panel="admin"
      title="Create Super Admin"
      subtitle="You are the first user. This account will have full control over all admins and access."
      footer={
        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <Link to="/admin/login" className="spa-auth-link">
            Sign In
          </Link>
        </p>
      }
    >
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control spa-auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control spa-auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="superadmin@starpolice.academy"
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Password</label>
          <PasswordInput
            className="form-control spa-auth-input"
            value={password}
            onChange={setPassword}
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn spa-auth-btn w-100" disabled={loading}>
          {loading ? "Creating..." : "Create Super Admin Account"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default AdminSignup;
