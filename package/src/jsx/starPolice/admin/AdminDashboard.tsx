import { useMemo } from "react";
import PageTitle from "../../layouts/PageTitle";
import { getCalendarUploadCounts, getMessages, getUploads } from "../storage";
import { FILE_CATEGORY_LABELS } from "../constants";

const AdminDashboard = () => {
  const uploads = getUploads();
  const messages = getMessages();
  const calendarCounts = getCalendarUploadCounts();

  const categoryCounts = useMemo(() => {
    return uploads.reduce<Record<string, number>>((acc, upload) => {
      acc[upload.category] = (acc[upload.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [uploads]);

  return (
    <>
      <PageTitle motherMenu="Admin Panel" activeMenu="Dashboard" pageContent="" />
      <div className="row">
        <div className="col-xl-3 col-sm-6">
          <div className="card star-police-stat-card">
            <div className="card-body">
              <h6 className="text-muted">Total Uploads</h6>
              <h2 className="star-police-title">{uploads.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="card star-police-stat-card">
            <div className="card-body">
              <h6 className="text-muted">Active Days</h6>
              <h2 className="star-police-title">{Object.keys(calendarCounts).length}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="card star-police-stat-card">
            <div className="card-body">
              <h6 className="text-muted">Student Messages</h6>
              <h2 className="star-police-title">
                {messages.filter((item) => item.senderRole === "student").length}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6">
          <div className="card star-police-stat-card">
            <div className="card-body">
              <h6 className="text-muted">Admin Replies</h6>
              <h2 className="star-police-title">
                {messages.filter((item) => item.senderRole === "admin").length}
              </h2>
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
                  <strong>{categoryCounts[key] ?? 0}</strong>
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
              {uploads.length === 0 ? (
                <p className="text-muted mb-0">No uploads yet. Use Daywise Upload to add materials.</p>
              ) : (
                uploads.slice(0, 5).map((upload) => (
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
