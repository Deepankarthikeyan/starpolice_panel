import PageTitle from "../../layouts/PageTitle";
import { useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";

const PanelSettings = () => {
  const { auth } = useContext(ThemeContext);

  return (
    <>
      <PageTitle
        motherMenu={auth?.panel === "student" ? "Student Panel" : "Admin Panel"}
        activeMenu="Settings"
        pageContent=""
      />
      <div className="row">
        <div className="col-xl-8">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Account Settings</h4>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label">Display Name</label>
                <input type="text" className="form-control" value={auth?.name ?? ""} readOnly />
              </div>
              <div className="mb-4">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={auth?.email ?? ""} readOnly />
              </div>
              <div className="mb-0">
                <label className="form-label">Account Type</label>
                <input type="text" className="form-control text-capitalize" value={auth?.role ?? ""} readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelSettings;
