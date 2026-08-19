import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { PasswordInput } from "../../starPolice/shared/PasswordInput";
import { api, storeAuth } from "../../starPolice/api";
import { notify } from "../../starPolice/toast";
import type { AuthUser } from "../../starPolice/types";

interface Props {
  setAuth: (auth: AuthUser) => void;
}

const AdminLogin = ({ setAuth }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await api.login(email, password, "admin");
      storeAuth(user);
      setAuth(user);
      notify.success("Signed in successfully.");
      navigate("/admin/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      notify.error(err, "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panel="admin"
      title="Admin Sign In"
      subtitle="Sign in to manage uploads, students, and academy access."
      footer={
        <p className="text-center mt-3 mb-0">
          First time setup?{" "}
          <Link to="/admin/signup" className="spa-auth-link">
            Create Super Admin
          </Link>
          {" · "}
          <Link to="/staff/login" className="spa-auth-link">
            Staff login
          </Link>
        </p>
      }
    >
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control spa-auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@starpolice.academy"
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Password</label>
          <PasswordInput
            className="form-control spa-auth-input"
            value={password}
            onChange={setPassword}
            placeholder="Enter password"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn spa-auth-btn w-100" disabled={loading}>
          {loading ? "Signing in..." : "Sign In to Admin Panel"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
