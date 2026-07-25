import { useContext } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";

const PanelProfile = () => {
  const { auth } = useContext(ThemeContext);

  return (
    <>
      <PageTitle
        motherMenu={auth?.panel === "student" ? "Student Panel" : "Admin Panel"}
        activeMenu="Profile"
        pageContent=""
      />
      <div className="row">
        <div className="col-xl-4">
          <div className="card">
            <div className="card-body text-center p-4">
              <div
                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "5rem", height: "5rem", fontSize: "1.75rem", fontWeight: 700 }}
              >
                {auth?.name?.charAt(0) ?? "U"}
              </div>
              <h4 className="mb-1">{auth?.name}</h4>
              <p className="text-muted mb-0">{auth?.email}</p>
            </div>
          </div>
        </div>
        <div className="col-xl-8">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Profile Details</h4>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-muted">Full Name</label>
                  <div className="fw-semibold">{auth?.name}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Email</label>
                  <div className="fw-semibold">{auth?.email}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Role</label>
                  <div className="fw-semibold text-capitalize">{auth?.role}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted">Panel</label>
                  <div className="fw-semibold text-capitalize">{auth?.panel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelProfile;
