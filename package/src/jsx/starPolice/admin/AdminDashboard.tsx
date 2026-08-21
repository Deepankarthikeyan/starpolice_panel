import { useContext, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import { getPanelMotherMenu } from "../panelLabels";
import type { DashboardStats } from "../types";

const AdminDashboard = () => {
  const { auth } = useContext(ThemeContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Dashboard" pageContent="" />
      <div className="row">
        <div className="col-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Total Uploads</h6>
              <h2>{stats?.totalUploads ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Active Days</h6>
              <h2>{stats?.activeDays ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Student Messages</h6>
              <h2>{stats?.studentMessages ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Admin Replies</h6>
              <h2>{stats?.adminReplies ?? 0}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Upload Categories</h4>
            </div>
            <div className="card-body">
              {Object.entries(FILE_CATEGORY_LABELS).map(([key, label]) => (
                <div key={key} className="d-flex justify-content-between py-2 border-bottom">
                  <span>{label}</span>
                  <strong>{stats?.categoryCounts?.[key] ?? 0}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Recent Uploads</h4>
            </div>
            <div className="card-body">
              {!stats?.recentUploads?.length ? (
                <p className="text-muted mb-0">No uploads yet. Use Daywise Upload to add materials.</p>
              ) : (
                stats.recentUploads.map((upload) => (
                  <div key={upload.id} className="d-flex justify-content-between py-2 border-bottom">
                    <div>
                      <div className="fw-semibold">{upload.name}</div>
                      <small className="text-muted">
                        {upload.date} • {FILE_CATEGORY_LABELS[upload.category]}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
