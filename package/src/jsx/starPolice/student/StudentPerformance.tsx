import { useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import PhysicalRecordCard from "../shared/PhysicalRecordCard";
import {
  emptyPerformanceForm,
  getCardTypeFromGender,
  overallPerformanceBadgeClass,
  overallPerformanceLabel,
  recordToForm,
  type StudentPerformanceRecord,
} from "../admin/performanceDefaults";

const StudentPerformance = () => {
  const [form, setForm] = useState<StudentPerformanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMyStudentPerformance()
      .then((record) => {
        if (record.hasRecord) {
          setForm({ ...recordToForm(record), hasRecord: true });
          return;
        }
        const cardType = record.cardType || getCardTypeFromGender(record.student?.gender);
        setForm({
          ...emptyPerformanceForm(record.student?.studentOnboardingId || "", cardType, record.student),
          hasRecord: false,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Physical Performance" pageContent="" />

      {loading ? (
        <div className="card">
          <div className="card-body">
            <p className="text-muted mb-0">Loading your physical performance record...</p>
          </div>
        </div>
      ) : !form ? (
        <div className="card">
          <div className="card-body">
            <p className="text-muted mb-0">Unable to load your performance record.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="row mb-3">
            <div className="col-md-4 col-sm-6">
              <div className="card">
                <div className="card-body">
                  <h6 className="text-muted">Overall Performance</h6>
                  <span className={`badge ${overallPerformanceBadgeClass(form.overallPerformance)}`}>
                    {form.overallPerformance ? overallPerformanceLabel(form.overallPerformance) : "Not rated yet"}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6">
              <div className="card">
                <div className="card-body">
                  <h6 className="text-muted">Record Year</h6>
                  <h4 className="mb-0">{form.recordYear}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-6">
              <div className="card">
                <div className="card-body">
                  <h6 className="text-muted">Card Type</h6>
                  <h4 className="mb-0 text-capitalize">{form.cardType}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">TNUSRB Physical Efficiency Record</h4>
            </div>
            <div className="card-body">
              {!form.hasRecord && (
                <div className="alert alert-info">
                  Your physical director has not published your performance record yet. The form below shows the
                  benchmark standards for your category.
                </div>
              )}
              <PhysicalRecordCard form={form} readOnly />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StudentPerformance;
