import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/star-police-academy-logo.png";
import { DEMO_USERS } from "../constants";
import type { UserRole } from "../types";
import "../styles.css";

interface Props {
  setAuth: (auth: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
  }) => void;
}

const Login = ({ setAuth }: Props) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("admin@starpolice.academy");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const onRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    const demoUser = DEMO_USERS.find((user) => user.role === nextRole);
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(demoUser.password);
    }
    setError("");
  };

  const onLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = DEMO_USERS.find(
      (item) =>
        item.email === email &&
        item.password === password &&
        item.role === role
    );

    if (!user) {
      setError("Invalid credentials for the selected panel.");
      return;
    }

    localStorage.setItem("AUTH", JSON.stringify(user));
    setAuth(user);
    navigate(role === "admin" ? "/admin/dashboard" : "/student-panel/dashboard");
  };

  return (
    <div className="container h-100 py-4">
      <div className="row h-100 align-items-center justify-content-center">
        <div className="col-xl-10">
          <div className="card star-police-login-card">
            <div className="card-body p-0">
              <div className="row g-0">
                <div className="col-lg-6 star-police-login-side d-flex flex-column justify-content-center p-5 text-center">
                  <div className="star-police-brand mb-4">
                    <img src={logo} alt="Star Police Academy" className="img-fluid" />
                  </div>
                  <h3 className="mb-2">Welcome to {role === "admin" ? "Admin" : "Student"} Panel</h3>
                  <p className="mb-0 opacity-75">
                    Star Police Academy, Vellore — No. 1 Police Academy in Tamil Nadu
                  </p>
                </div>
                <div className="col-lg-6 p-5">
                  <h4 className="star-police-title mb-1">Sign In</h4>
                  <p className="text-muted mb-4">Choose your panel and login with your credentials.</p>

                  <div className="btn-group w-100 mb-4" role="group">
                    <button
                      type="button"
                      className={`btn btn-outline-primary star-police-role-btn ${
                        role === "admin" ? "active" : ""
                      }`}
                      onClick={() => onRoleChange("admin")}
                    >
                      Admin Panel
                    </button>
                    <button
                      type="button"
                      className={`btn btn-outline-primary star-police-role-btn ${
                        role === "student" ? "active" : ""
                      }`}
                      onClick={() => onRoleChange("student")}
                    >
                      Student Panel
                    </button>
                  </div>

                  {error && <div className="alert alert-danger py-2">{error}</div>}

                  <form onSubmit={onLogin}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Login to {role === "admin" ? "Admin" : "Student"} Panel
                    </button>
                  </form>

                  <div className="mt-4 small text-muted">
                    <div>Admin: admin@starpolice.academy / admin123</div>
                    <div>Student: student@starpolice.academy / student123</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
