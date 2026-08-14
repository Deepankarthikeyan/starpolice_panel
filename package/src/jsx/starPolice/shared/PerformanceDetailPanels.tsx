import { useMemo } from "react";
import PhysicalRecordCard from "./PhysicalRecordCard";
import { formatPercent, type StudentExamMarkEntry, type StudentPerformanceDetail } from "../admin/examDefaults";
import {
  overallPerformanceLabel,
  recordToForm,
  type StudentPerformanceRecord,
} from "../admin/performanceDefaults";

export type PerformanceSection = "attendance" | "physical" | "written";

export function PerformanceSummaryCard({
  label,
  value,
  subtext,
  active,
  onClick,
  clickable = true,
}: {
  label: string;
  value: string;
  subtext?: string;
  active?: boolean;
  onClick?: () => void;
  clickable?: boolean;
}) {
  const content = (
    <div className="card-body">
      <p className="text-muted mb-1">{label}</p>
      <h4 className="mb-0">{value}</h4>
      {subtext && <small className="text-muted">{subtext}</small>}
    </div>
  );

  if (!clickable) {
    return (
      <div className="col-md-3 col-sm-6">
        <div className="card h-100 spa-performance-card">{content}</div>
      </div>
    );
  }

  return (
    <div className="col-md-3 col-sm-6">
      <button
        type="button"
        className={`card h-100 w-100 text-start spa-performance-card ${active ? "is-active" : ""}`}
        onClick={onClick}
      >
        {content}
      </button>
    </div>
  );
}

export function ExamMarksTable({ title, exams }: { title: string; exams: StudentExamMarkEntry[] }) {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">
        {exams.length === 0 ? (
          <p className="text-muted mb-0">No exam records yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Out of</th>
                  <th>Scored</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.examId}>
                    <td>{exam.name}</td>
                    <td>{exam.subjectName || "—"}</td>
                    <td>{exam.totalMarks}</td>
                    <td>
                      {exam.scoredMarks === "" || exam.scoredMarks === null || exam.scoredMarks === undefined
                        ? "—"
                        : exam.scoredMarks}
                    </td>
                    <td>{exam.remarks || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function PerformanceDetailPanels({
  detail,
  activeSection,
  onSectionChange,
  showPhysicalRecord = false,
}: {
  detail: StudentPerformanceDetail;
  activeSection: PerformanceSection;
  onSectionChange: (section: PerformanceSection) => void;
  showPhysicalRecord?: boolean;
}) {
  const attendanceStats = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0, leave: 0 };
    detail.attendance.forEach((item) => {
      if (item.status === "present") stats.present += 1;
      else if (item.status === "absent") stats.absent += 1;
      else if (item.status === "late") stats.late += 1;
      else if (item.status === "leave") stats.leave += 1;
    });
    return stats;
  }, [detail.attendance]);

  const performanceForm: StudentPerformanceRecord | null =
    detail.performance.hasRecord && detail.performance
      ? recordToForm(detail.performance as StudentPerformanceRecord)
      : null;

  return (
    <>
      <div className="row mb-4 g-3">
        <PerformanceSummaryCard
          label="Attendance"
          value={formatPercent(detail.summary.attendancePercent)}
          subtext={`${detail.summary.attendancePresent}/${detail.summary.attendanceTotal} days`}
          active={activeSection === "attendance"}
          onClick={() => onSectionChange("attendance")}
        />
        <PerformanceSummaryCard
          label="Physical Exam"
          value={formatPercent(detail.summary.physicalExamPercent)}
          active={activeSection === "physical"}
          onClick={() => onSectionChange("physical")}
        />
        <PerformanceSummaryCard
          label="Written Exam"
          value={formatPercent(detail.summary.writtenExamPercent)}
          active={activeSection === "written"}
          onClick={() => onSectionChange("written")}
        />
        <PerformanceSummaryCard
          label="Overall Performance"
          value={formatPercent(detail.summary.overallPercent)}
          subtext={
            detail.summary.overallPerformance
              ? overallPerformanceLabel(detail.summary.overallPerformance as never)
              : undefined
          }
          clickable={false}
        />
      </div>

      {activeSection === "attendance" && (
        <div className="card mb-4">
          <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="card-title mb-0">Attendance List</h5>
            <span className="badge bg-primary">{formatPercent(detail.summary.attendancePercent)}</span>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge badge-success">Present {attendanceStats.present}</span>
              <span className="badge badge-danger">Absent {attendanceStats.absent}</span>
              <span className="badge badge-warning">Late {attendanceStats.late}</span>
              <span className="badge badge-info">Leave {attendanceStats.leave}</span>
            </div>
            {detail.attendance.length === 0 ? (
              <p className="text-muted mb-0">No attendance records yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.attendance.map((item) => (
                      <tr key={item.date}>
                        <td>{item.date}</td>
                        <td className="text-capitalize">{item.status || "Not marked"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === "physical" && (
        <>
          <ExamMarksTable title="Physical Exam Performance List" exams={detail.physicalExams} />
          {showPhysicalRecord && performanceForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Physical Efficiency Record Card</h5>
              </div>
              <div className="card-body">
                <PhysicalRecordCard form={performanceForm} readOnly />
              </div>
            </div>
          )}
        </>
      )}

      {activeSection === "written" && (
        <ExamMarksTable title="Written Exam Performance List" exams={detail.writtenExams} />
      )}
    </>
  );
}
