import emblem from "../../../assets/images/star-police-academy-emblem.png";
import adminVector from "../../../assets/images/svg/admin-panel.svg";

interface AuthLayoutProps {
  panel: "admin" | "staff" | "student";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthLayout = ({ panel, title, subtitle, children, footer }: AuthLayoutProps) => {
  const vectorImage = adminVector;

  return (
    <div className="spa-auth-page spa-auth-admin">
      <div className="spa-auth-overlay" />
      <div className="container spa-auth-container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-xl-10">
            <div className="spa-auth-card row g-0 overflow-hidden">
              <div className="col-lg-6 spa-auth-brand">
                <div className="spa-auth-brand-inner">
                  <img src={emblem} alt="Star Police Academy" className="spa-auth-logo-small" />
                  <h1>Star Police Academy</h1>
                  <p>
                    {panel === "student"
                      ? "Your study hub for materials, calendar, and admin interaction."
                      : panel === "staff"
                        ? "Staff workspace for uploads, student support, and daily academy operations."
                        : "Command center for uploads, student access, and academy operations."}
                  </p>
                  <img
                    src={vectorImage}
                    alt=""
                    className="spa-auth-vector"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="col-lg-6 spa-auth-form-wrap">
                <div className="spa-auth-form-inner">
                  <div className="spa-auth-mobile-brand">
                    <img src={emblem} alt="Star Police Academy" className="spa-auth-logo-small" />
                    <p>Star Police Academy</p>
                  </div>
                  <h2>{title}</h2>
                  <p className="spa-auth-subtitle">{subtitle}</p>
                  {children}
                  {footer}
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
