import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../assets/images/logo-full.png";

interface Errors {
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({ email: "", password: "" });
  const navigate = useNavigate();

  const onSignUp = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const newErrors: Errors = { email: "", password: "" };
    let hasError = false;

    if (!email) {
      newErrors.email = "Email is required";
      hasError = true;
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: newErrors.email,
      });
    }

    if (!password) {
      newErrors.password = "Password is required";
      hasError = true;
      Swal.fire({
        icon: "error",
        title: "Oops",
        text: newErrors.password,
      });
    }

    setErrors(newErrors);
    if (hasError) return;

    // Simulate saving data to localStorage
    const userData = { email, password };
    localStorage.setItem("AUTH", JSON.stringify(userData));

    Swal.fire({
      icon: "success",
      title: "Registration Successful",
      text: "Your account has been created successfully.",
    });

    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="authincation h-100 p-meddle">
      <div className="container h-100">
        <div className="row justify-content-center h-100 align-items-center">
          <div className="col-md-6">
            <div className="authincation-content">
              <div className="row no-gutters">
                <div className="col-xl-12">
                  <div className="auth-form">
                    <div className="text-center mb-3">
                      <Link to="/login">
                        <img src={logo} alt="Logo" />
                      </Link>
                    </div>
                    <h4 className="text-center mb-4">Sign up your account</h4>
                    <form onSubmit={onSignUp}>
                      <div className="form-group mb-3">
                        <label className="mb-1">
                          <strong>Username</strong>
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="username"
                          required
                        />
                      </div>
                      <div className="form-group mb-3">
                        <label className="mb-1">
                          <strong>Email</strong>
                          <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email"
                        />
                        {errors.email && (
                          <div className="text-danger fs-12">
                            {errors.email}
                          </div>
                        )}
                      </div>
                      <div className="form-group mb-3">
                        <label className="mb-1">
                          <strong>Password</strong>
                          <span className="required">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="password"
                        />
                        {errors.password && (
                          <div className="text-danger fs-12">
                            {errors.password}
                          </div>
                        )}
                      </div>
                      <div className="text-center mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-block"
                        >
                          Sign me up
                        </button>
                      </div>
                    </form>
                    <div className="new-account mt-3">
                      <p>
                        Already have an account?{" "}
                        <Link className="text-primary" to="/login">
                          Sign in
                        </Link>
                      </p>
                    </div>
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

export default Register;
