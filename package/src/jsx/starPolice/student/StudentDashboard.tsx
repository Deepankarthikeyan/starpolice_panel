import { useMemo } from "react";
import PageTitle from "../../layouts/PageTitle";
import { getMessages, getUploads } from "../storage";
import { FILE_CATEGORY_LABELS } from "../constants";

const StudentDashboard = () => {
  const uploads = getUploads();
  const messages = getMessages();

  const latestUploads = useMemo(() => uploads.slice(0, 6), [uploads]);
  const unreadAdminMessages = messages.filter((item) => item.senderRole === "admin").length;

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
              <h2>
                {new Set(uploads.map((item) => item.date)).size}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-sm-6">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Admin Messages</h6>
              <h2>{unreadAdminMessages}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">Latest Study Materials</h4>
        </div>
        <div className="card-body">
          {latestUploads.length === 0 ? (
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
                  {latestUploads.map((upload) => (
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
