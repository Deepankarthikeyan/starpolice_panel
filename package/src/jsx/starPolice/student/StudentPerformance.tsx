import { useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import type { StudentPerformanceDetail } from "../admin/examDefaults";
import {
  PerformanceDetailPanels,
  type PerformanceSection,
} from "../shared/PerformanceDetailPanels";

const StudentPerformance = () => {
  const [detail, setDetail] = useState<StudentPerformanceDetail | null>(null);
  const [activeSection, setActiveSection] = useState<PerformanceSection>("attendance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getMyStudentPerformanceDetail()
      .then((data) => {
        setDetail(data);
        setActiveSection("attendance");
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load your performance.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="My Performance" pageContent="" />

      {loading ? (
        <div className="card">
          <div className="card-body">
            <p className="text-muted mb-0">Loading your performance...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card">
          <div className="card-body">
            <p className="text-danger mb-0">{error}</p>
          </div>
        </div>
      ) : !detail ? (
        <div className="card">
          <div className="card-body">
            <p className="text-muted mb-0">Unable to load your performance.</p>
          </div>
        </div>
      ) : (
        <div className="spa-performance-detail">
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="card-title mb-0">My Performance</h4>
              <small className="text-muted">
                {detail.student.fullName} · {detail.student.studentId} · Batch {detail.student.batch || "—"}
              </small>
            </div>
            <div className="card-body">
              <p className="text-muted mb-0">
                Tap a card below to view your attendance, physical exam, or written exam performance.
              </p>
            </div>
          </div>

          <PerformanceDetailPanels
            detail={detail}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            showPhysicalRecord
          />
        </div>
      )}
    </>
  );
};

export default StudentPerformance;
