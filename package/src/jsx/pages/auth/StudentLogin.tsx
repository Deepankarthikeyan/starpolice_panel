import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import emblem from "../../../assets/images/star-police-academy-emblem.png";
import "../../../assets/css/student-login.css";
import { api, storeAuth } from "../../starPolice/api";
import type { AuthUser } from "../../starPolice/types";

interface Props {
  setAuth: (auth: AuthUser) => void;
}

const features = [
  {
    icon: "fa-book",
    title: "Study Materials",
    text: "Access daily uploads and coaching notes.",
  },
  {
    icon: "fa-calendar",
    title: "Training Calendar",
    text: "Track schedules and important exam dates.",
  },
  {
    icon: "fa-comments",
    title: "Admin Interaction",
    text: "Message your academy team anytime.",
  },
  {
    icon: "fa-graduation-cap",
    title: "TNUSRB Coaching",
    text: "Built for police recruitment preparation.",
  },
];

const StudentLogin = ({ setAuth }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="spa-student-login">
      <div className="spa-student-login-bg" aria-hidden="true">
        <div className="spa-student-login-aurora" />
        <div className="spa-student-login-grid" />
        <div className="spa-student-login-orbs">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="spa-student-login-shell">
        <section className="spa-student-login-hero">
          <div className="spa-student-login-badge">
            <span className="spa-student-login-badge-dot" />
            Student Portal
          </div>

          <div className="spa-student-login-emblem-wrap">
            <div className="spa-student-login-emblem-ring" />
            <img src={emblem} alt="Star Police Academy" className="spa-student-login-emblem" />
          </div>

          <h1>
            Train Smart.
            <span>Serve with Pride.</span>
          </h1>
          <p>
            Your personal academy hub for study materials, schedules, and direct support from the
            Star Police Academy team.
          </p>

          <div className="spa-student-login-features">
            {features.map((feature) => (
              <article key={feature.title} className="spa-student-login-feature">
                <div className="spa-student-login-feature-icon">
                  <i className={`fa ${feature.icon}`} aria-hidden="true" />
                </div>
                <div>
                  <strong>{feature.title}</strong>
                  <span>{feature.text}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="spa-student-login-card">
          <div className="spa-student-login-card-head">
            <h2>Welcome Back, Cadet</h2>
            <p>Sign in with the credentials shared by your academy admin.</p>
          </div>

          {error && <div className="spa-student-login-alert spa-student-login-alert-error">{error}</div>}

          <div className="spa-student-login-alert spa-student-login-alert-info">
            Student accounts are created by an admin. Contact your admin if you need access.
          </div>

          <form onSubmit={onSubmit}>
            <div className="spa-student-login-field">
              <label htmlFor="student-email">Email Address</label>
              <div className="spa-student-login-input-wrap">
                <i className="fa fa-envelope" aria-hidden="true" />
                <input
                  id="student-email"
                  type="email"
                  className="spa-student-login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@starpolice.academy"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="spa-student-login-field">
              <label htmlFor="student-password">Password</label>
              <div className="spa-student-login-input-wrap">
                <i className="fa fa-lock" aria-hidden="true" />
                <input
                  id="student-password"
                  type={showPassword ? "text" : "password"}
                  className="spa-student-login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="spa-student-login-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
                </button>
              </div>
            </div>

            <button type="submit" className="spa-student-login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Enter Student Panel"}
            </button>
          </form>

          <p className="spa-student-login-footnote">Star Police Academy · TNUSRB Coaching Platform</p>
        </section>
      </div>
    </div>
  );
};

export default StudentLogin;
