import { Link } from "react-router-dom";
import logo from "../../../assets/images/star-police-academy-logo-white.png";
import pol from "../../../assets/images/pol.jpg";

interface AuthLayoutProps {
  panel: "admin" | "student";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthLayout = ({ panel, title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <div className={`spa-auth-page spa-auth-${panel}`}>
      <div className="spa-auth-bg" style={{ backgroundImage: `url(${pol})` }} />
      <div className="spa-auth-overlay" />
      <div className="container spa-auth-container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-xl-10">
            <div className="spa-auth-card row g-0 overflow-hidden">
              <div className="col-lg-6 spa-auth-brand">
                <div className="spa-auth-brand-inner">
                  <img src={logo} alt="Star Police Academy" className="spa-auth-logo" />
                  <h1>Star Police Academy</h1>
                  <p>
                    {panel === "admin"
                      ? "Command center for uploads, student access, and academy operations."
                      : "Your study hub for materials, calendar, and admin interaction."}
                  </p>
                  <div className="spa-auth-badges">
                    <span>{panel === "admin" ? "Admin Portal" : "Student Portal"}</span>
                    <span>Vellore</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 spa-auth-form-wrap">
                <div className="spa-auth-form-inner">
                  <h2>{title}</h2>
                  <p className="spa-auth-subtitle">{subtitle}</p>
                  {children}
                  {footer}
                  <div className="spa-auth-switch mt-4 text-center">
                    {panel === "admin" ? (
                      <span>
                        Student?{" "}
                        <Link to="/student/login" className="spa-auth-link">
                          Go to Student Panel
                        </Link>
                      </span>
                    ) : (
                      <span>
                        Admin?{" "}
                        <Link to="/admin/login" className="spa-auth-link">
                          Go to Admin Panel
                        </Link>
                      </span>
                    )}
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

export default AuthLayout;
