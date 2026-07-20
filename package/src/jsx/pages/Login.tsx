import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/star-police-academy-logo-white.png";
import pol from "../../assets/images/pol.jpg";
import BgImage from "../../assets/images/bg1.png";
import { DEMO_USERS } from "../starPolice/constants";
import { api } from "../starPolice/api";
import type { AuthUser, UserRole } from "../starPolice/types";

interface Props {
  setAuth: (auth: AuthUser) => void;
}

const Login: React.FC<Props> = ({ setAuth }) => {
  const [role, setRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("admin@starpolice.academy");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    const demoUser = DEMO_USERS.find((user) => user.role === nextRole);
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(demoUser.password);
    }
    setError("");
  };

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await api.login(email, password, role);
      localStorage.setItem("AUTH", JSON.stringify(user));
      setAuth(user);
      navigate(role === "admin" ? "/admin-dashboard" : "/student-dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container h-100">
      <div className="row h-100 align-items-center justify-contain-center">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="row m-0">
                <div
                  className="col-xl-6 col-md-6 sign text-center sign-bg"
                  style={{ backgroundImage: "url(" + pol + ")" }}
                >
                  <div>
                    <div className="text-center my-5">
                      <Link to={"#"}>
                        <img
                          className="logo-abbr dark-logo star-police-login-logo"
                          src={logo}
                          alt="Star Police Academy"
                        />
                      </Link>
                    </div>
                    <img
                      src={BgImage}
                      className="slideskew img-fix bitcoin-img"
                    />
                  </div>
                </div>
                <div className="col-xl-6 col-md-6">
                  <div className="sign-in-your px-2">
                    <h4 className="fs-20">Sign in your account</h4>
                    <span>
                      Welcome to Star Police Academy. Choose your panel and sign
                      in.
                    </span>

                    <div className="btn-group w-100 my-4" role="group">
                      <button
                        type="button"
                        className={`btn ${
                          role === "admin" ? "btn-primary" : "btn-outline-primary"
                        }`}
                        onClick={() => onRoleChange("admin")}
                      >
                        Admin Panel
                      </button>
                      <button
                        type="button"
                        className={`btn ${
                          role === "student"
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => onRoleChange("student")}
                      >
                        Student Panel
                      </button>
                    </div>

                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <form onSubmit={onLogin}>
                      <div className="mb-3">
                        <label className="mb-1">
                          <strong>Email</strong>
                          <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Type Your Email Address"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="mb-1">
                          <strong>Password</strong>
                          <span className="required">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          value={password}
                          placeholder="Type Your Password"
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="text-center">
                        <button
                          type="submit"
                          className="btn btn-primary btn-block"
                          disabled={loading}
                        >
                          {loading ? "Signing in..." : "Sign Me In"}
                        </button>
                      </div>
                    </form>
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
