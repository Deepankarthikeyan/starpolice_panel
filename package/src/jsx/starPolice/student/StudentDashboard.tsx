import { useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import type { UploadedFile } from "../types";

const StudentDashboard = () => {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [adminMessages, setAdminMessages] = useState(0);

  useEffect(() => {
    Promise.all([api.getUploads(), api.getMessages()])
      .then(([uploadData, messageData]) => {
        setUploads(uploadData);
        setAdminMessages(
          messageData.filter((item) => item.senderRole === "admin" || item.senderRole === "superadmin").length
        );
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Dashboard" pageContent="" />
      <div className="row">
        <div className="col-xl-4 col-sm-6">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Available Materials</h6>
              <h2>{uploads.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-sm-6">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Study Days</h6>
              <h2>{new Set(uploads.map((item) => item.date)).size}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-sm-6">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Admin Messages</h6>
              <h2>{adminMessages}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">Latest Study Materials</h4>
        </div>
        <div className="card-body">
          {uploads.length === 0 ? (
            <p className="text-muted mb-0">No materials uploaded yet by admin.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.slice(0, 6).map((upload) => (
                    <tr key={upload.id}>
                      <td>{upload.date}</td>
                      <td>{upload.name}</td>
                      <td>{FILE_CATEGORY_LABELS[upload.category]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
