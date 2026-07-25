import { useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import type { StudentDashboardStats } from "../types";

const StudentDashboard = () => {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);

  useEffect(() => {
    api.getStudentDashboardStats().then(setStats).catch(console.error);
  }, []);

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Dashboard" pageContent="" />
      <div className="row">
        <div className="col-xl-4 col-sm-6">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Available Materials</h6>
              <h2>{stats?.materialCount ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-sm-6">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Study Days</h6>
              <h2>{stats?.studyDays ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-sm-6">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Admin Messages</h6>
              <h2>{stats?.adminMessages ?? 0}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">Latest Study Materials</h4>
        </div>
        <div className="card-body">
          {!stats?.latestUploads?.length ? (
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
                  {stats.latestUploads.map((upload) => (
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
