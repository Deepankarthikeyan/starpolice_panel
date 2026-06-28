import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo-full.png";
import logolight from "../../assets/images/logo-white.png";
import pol from "../../assets/images/pol.jpg";
import BgImage from "../../assets/images/bg1.png";

interface Props {
  setAuth: (auth: { email: string; password: string }) => void;
}

interface Errors {
  email: string;
  password: string;
}

const Login: React.FC<Props> = ({ setAuth }) => {
  const [email, setEmail] = useState<string>("demo@example.com");
  const [password, setPassword] = useState<string>("123456");
  const [errors, setErrors] = useState<Errors>({ email: "", password: "" });
  const navigate = useNavigate();

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

    const user = { email, password };
    localStorage.setItem("AUTH", JSON.stringify(user));
    setAuth(user); // Update parent state
    navigate("/dashboard"); // Redirect to dashboard
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
                          className="logo-abbr dark-logo"
                          width="200"
                          src={logo}
                          alt=""
                        />
                        <img
                          className="logo-abbr light-logo text-center m-auto"
                          width="200"
                          src={logolight}
                          alt=""
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
                    <h4 className="fs-20 ">Sign in your account</h4>
                    <span>
                      Welcome back! Login with your data that you entered during
                      registration
                    </span>
                    <div className="login-social">
                      <Link to={"#"} className="btn btn-primary  d-block my-3">
                        <i className="fab fa-google me-2"></i>Login with Google
                      </Link>
                      <Link
                        to={"#"}
                        className="btn btn-secondary  d-block my-3"
                      >
                        <i className="fab fa-facebook-f me-2 facebook-log"></i>
                        Login with Facebook
                      </Link>
                    </div>
                    {errors.email && (
                      <div className="bg-red-300 text-red-900 border border-red-900 p-1 my-2">
                        {errors.email}
                      </div>
                    )}
                    {errors.password && (
                      <div className="bg-green-300 text-green-900 border border-green-900 p-1 my-2">
                        {errors.password}
                      </div>
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

                        {errors.email && (
                          <div className="text-danger fs-12">
                            {errors.email}
                          </div>
                        )}
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
                        <div className="mb-3">
                          <Link to="/page-register">Sign up</Link>
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
