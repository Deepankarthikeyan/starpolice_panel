import { useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import {
  overallPerformanceBadgeClass,
  overallPerformanceLabel,
  recordToForm,
} from "../admin/performanceDefaults";
import type { StudentDashboardStats } from "../types";
import type { StudentPerformanceRecord } from "../admin/performanceDefaults";

const StudentDashboard = () => {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [performance, setPerformance] = useState<StudentPerformanceRecord | null>(null);

  useEffect(() => {
    api.getStudentDashboardStats().then(setStats).catch(console.error);
    api
      .getMyStudentPerformance()
      .then((record) => {
        if (record.hasRecord) {
          setPerformance(recordToForm(record));
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Dashboard" pageContent="" />
      <div className="row">
        <div className="col-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Available Materials</h6>
              <h2>{stats?.materialCount ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Study Days</h6>
              <h2>{stats?.studyDays ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Admin Messages</h6>
              <h2>{stats?.adminMessages ?? 0}</h2>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <h6 className="text-muted">Overall Physical Performance</h6>
              <span className={`badge ${overallPerformanceBadgeClass(performance?.overallPerformance || "")}`}>
                {performance?.overallPerformance
                  ? overallPerformanceLabel(performance.overallPerformance)
                  : "Not rated yet"}
              </span>
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
