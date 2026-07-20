import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/star-police-academy-logo.png";
import pol from "../../assets/images/pol.jpg";
import BgImage from "../../assets/images/bg1.png";
import { DEMO_USERS } from "../starPolice/constants";
import type { AuthUser, UserRole } from "../starPolice/types";

interface Props {
  setAuth: (auth: AuthUser) => void;
}

interface Errors {
  email: string;
  password: string;
}

const Login: React.FC<Props> = ({ setAuth }) => {
  const [role, setRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("admin@starpolice.academy");
  const [password, setPassword] = useState("admin123");
  const [errors, setErrors] = useState<Errors>({ email: "", password: "" });
  const navigate = useNavigate();

  const onRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    const demoUser = DEMO_USERS.find((user) => user.role === nextRole);
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(demoUser.password);
    }
    setErrors({ email: "", password: "" });
  };

  const onLogin = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const newErrors: Errors = { email: "", password: "" };
    let hasError = false;

    if (!email) {
      newErrors.email = "Email is required";
      hasError = true;
    }
    if (!password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    const user = DEMO_USERS.find(
      (item) =>
        item.email === email && item.password === password && item.role === role
    );

    if (!user) {
      setErrors({
        email: "Invalid credentials for the selected panel.",
        password: "",
      });
      return;
    }

    localStorage.setItem("AUTH", JSON.stringify(user));
    setAuth(user);
    navigate(
      role === "admin" ? "/admin-dashboard" : "/student-dashboard"
    );
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

                    {errors.email && (
                      <div className="alert alert-danger py-2">{errors.email}</div>
                    )}
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
                        />
                        {errors.password && (
                          <div className="text-danger fs-12">
                            {errors.password}
                          </div>
                        )}
                      </div>
                      <div className="row d-flex justify-content-between mt-4 mb-2">
                        <div className="mb-3">
                          <div className="form-check custom-checkbox ms-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="basic_checkbox_1"
                              required
                            />
                            <label
                              className="form-check-label"
                              htmlFor="basic_checkbox_1"
                            >
                              Remember my preference
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <button
                          type="submit"
                          className="btn btn-primary btn-block"
                        >
                          Sign Me In
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
