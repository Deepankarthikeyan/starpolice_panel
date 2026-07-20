import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { api, storeAuth } from "../../starPolice/api";
import type { AuthUser } from "../../starPolice/types";

interface Props {
  setAuth: (auth: AuthUser) => void;
}

const StudentLogin = ({ setAuth }: Props) => {
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
      const user = await api.login(email, password, "student");
      storeAuth(user);
      setAuth(user);
      navigate("/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panel="student"
      title="Student Sign In"
      subtitle="Use credentials provided by your academy admin."
    >
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="alert alert-light border mb-3 small">
        Student accounts are created by an admin. Contact your admin if you need access.
      </div>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control spa-auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@starpolice.academy"
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
        <button type="submit" className="btn spa-auth-btn spa-auth-btn-student w-100" disabled={loading}>
          {loading ? "Signing in..." : "Sign In to Student Panel"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default StudentLogin;
