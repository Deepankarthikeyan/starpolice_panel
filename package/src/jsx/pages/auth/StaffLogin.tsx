import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { api, storeAuth } from "../../starPolice/api";
import type { AuthUser } from "../../starPolice/types";

interface Props {
  setAuth: (auth: AuthUser) => void;
}

const StaffLogin = ({ setAuth }: Props) => {
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
      const user = await api.login(email, password, "staff");
      if (user.role === "superadmin") {
        setError("Super admin accounts should sign in from the admin login page.");
        return;
      }
      if (user.role !== "admin") {
        setError("Staff access requires an admin account created by the super admin.");
        return;
      }
      storeAuth(user);
      setAuth(user);
      navigate("/staff/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panel="staff"
      title="Staff Sign In"
      subtitle="Sign in to manage uploads, students, and academy operations."
      footer={
        <p className="text-center mt-3 mb-0">
          Super admin?{" "}
          <Link to="/admin/login" className="spa-auth-link">
            Admin login
          </Link>
        </p>
      }
    >
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="alert alert-light border mb-3 small">
        Staff accounts are created by the super admin. Contact your super admin if you need access.
      </div>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control spa-auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@starpolice.academy"
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control spa-auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>
        <button type="submit" className="btn spa-auth-btn w-100" disabled={loading}>
          {loading ? "Signing in..." : "Sign In to Staff Panel"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default StaffLogin;
