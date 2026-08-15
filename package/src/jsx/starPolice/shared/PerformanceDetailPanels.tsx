import { useMemo, useState } from "react";
import PhysicalRecordCard from "./PhysicalRecordCard";
import { formatPercent, type StudentExamMarkEntry, type StudentPerformanceDetail } from "../admin/examDefaults";
import {
  ATTENDANCE_STATUS_OPTIONS,
  formatDisplayDate,
  statusBadgeClass,
  statusLabel,
  type AttendanceStatus,
} from "../admin/attendanceDefaults";
import {
  buildPerformanceFormFromDetail,
  getTodayAttendanceStatus,
  overallPerformanceLabel,
  recordToForm,
  type StudentPerformanceRecord,
} from "../admin/performanceDefaults";

export type PerformanceSection = "attendance" | "physical" | "written";
export type AttendanceStatusFilter = "all" | Exclude<AttendanceStatus, "">;

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
    <div className="card-body spa-performance-card-body">
      <p className="spa-performance-card-label text-muted mb-2">{label}</p>
      <p className="spa-performance-card-value mb-1">{value}</p>
      {subtext && <p className="spa-performance-card-subtext text-muted mb-0">{subtext}</p>}
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

export function AttendancePerformanceList({
  attendance,
  attendancePercent,
}: {
  attendance: Array<{ date: string; status: string }>;
  attendancePercent: number | null;
}) {
  const [statusFilter, setStatusFilter] = useState<AttendanceStatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const attendanceStats = useMemo(() => {
    const stats = { present: 0, absent: 0, late: 0, leave: 0 };
    attendance.forEach((item) => {
      if (item.status === "present") stats.present += 1;
      else if (item.status === "absent") stats.absent += 1;
      else if (item.status === "late") stats.late += 1;
      else if (item.status === "leave") stats.leave += 1;
    });
    return stats;
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (dateFrom && item.date < dateFrom) return false;
      if (dateTo && item.date > dateTo) return false;
      return true;
    });
  }, [attendance, statusFilter, dateFrom, dateTo]);

  const hasActiveFilters = statusFilter !== "all" || Boolean(dateFrom) || Boolean(dateTo);

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="card mb-4">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h5 className="card-title mb-0">Attendance List</h5>
        <span className="badge bg-primary">{formatPercent(attendancePercent)}</span>
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            className={`badge border-0 spa-attendance-filter-badge ${statusFilter === "all" ? "badge-primary is-active" : "badge-light"}`}
            onClick={() => setStatusFilter("all")}
          >
            All {attendance.length}
          </button>
          {ATTENDANCE_STATUS_OPTIONS.map((option) => {
            const count = attendanceStats[option.value];
            return (
              <button
                key={option.value}
                type="button"
                className={`badge border-0 spa-attendance-filter-badge ${option.badgeClass} ${statusFilter === option.value ? "is-active" : ""}`}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label} {count}
              </button>
            );
          })}
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-4 col-sm-6">
            <label className="form-label small text-muted mb-1" htmlFor="attendance-status-filter">
              Status
            </label>
            <select
              id="attendance-status-filter"
              className="form-control form-control-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AttendanceStatusFilter)}
            >
              <option value="all">All statuses</option>
              {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4 col-sm-6">
            <label className="form-label small text-muted mb-1" htmlFor="attendance-date-from">
              From date
            </label>
            <input
              id="attendance-date-from"
              type="date"
              className="form-control form-control-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="col-md-4 col-sm-6">
            <label className="form-label small text-muted mb-1" htmlFor="attendance-date-to">
              To date
            </label>
            <input
              id="attendance-date-to"
              type="date"
              className="form-control form-control-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span className="text-muted small">
              Showing {filteredAttendance.length} of {attendance.length} records
            </span>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        {attendance.length === 0 ? (
          <p className="text-muted mb-0">No attendance records yet.</p>
        ) : filteredAttendance.length === 0 ? (
          <p className="text-muted mb-0">No attendance records match the selected filters.</p>
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
                {filteredAttendance.map((item) => (
                  <tr key={item.date}>
                    <td>{formatDisplayDate(item.date)}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(item.status as AttendanceStatus)}`}>
                        {statusLabel(item.status as AttendanceStatus)}
                      </span>
                    </td>
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
  physicalRecordReadOnly = true,
  physicalRecordForm,
  onPhysicalRecordChange,
}: {
  detail: StudentPerformanceDetail;
  activeSection: PerformanceSection;
  onSectionChange: (section: PerformanceSection) => void;
  showPhysicalRecord?: boolean;
  physicalRecordReadOnly?: boolean;
  physicalRecordForm?: StudentPerformanceRecord | null;
  onPhysicalRecordChange?: (next: StudentPerformanceRecord) => void;
}) {
  const performanceForm: StudentPerformanceRecord =
    physicalRecordForm ||
    (detail.performance.hasRecord && detail.performance
      ? recordToForm(detail.performance as StudentPerformanceRecord)
      : buildPerformanceFormFromDetail(detail));
  const todayAttendanceStatus = getTodayAttendanceStatus(detail.attendance);

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
        <AttendancePerformanceList
          attendance={detail.attendance}
          attendancePercent={detail.summary.attendancePercent}
        />
      )}

      {activeSection === "physical" && showPhysicalRecord && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">Physical Efficiency Record Card</h5>
          </div>
          <div className="card-body">
            <PhysicalRecordCard
              form={performanceForm}
              readOnly={physicalRecordReadOnly}
              onChange={onPhysicalRecordChange}
              todayAttendanceStatus={todayAttendanceStatus}
            />
          </div>
        </div>
      )}

      {activeSection === "written" && (
        <ExamMarksTable title="Written Exam Performance List" exams={detail.writtenExams} />
      )}
    </>
  );
}
