import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { PasswordInput } from "../../starPolice/shared/PasswordInput";
import { api, storeAuth } from "../../starPolice/api";
import { notify } from "../../starPolice/toast";
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
      notify.success("Signed in successfully.");
      navigate("/student/dashboard");
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
      panel="student"
      title="Student Sign In"
      subtitle="Sign in to access study materials, calendar, and admin interaction."
    >
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="alert alert-light border mb-3 small">
        Student accounts are created by an admin. Contact your admin if you need access.
      </div>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Email or Username</label>
          <input
            type="text"
            className="form-control spa-auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@starpolice.academy"
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
          {loading ? "Signing in..." : "Sign In to Student Panel"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default StudentLogin;
