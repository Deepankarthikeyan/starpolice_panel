import { useContext, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { hasPermission } from "../permissions";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import {
  ATTENDANCE_STATUS_OPTIONS,
  defaultStatusForNewMark,
  formatDisplayDate,
  isAfterAttendanceCutoff,
  resolveMarkStatus,
  sortAttendanceRows,
  statusBadgeClass,
  statusLabel,
  todayDateString,
  toDateObject,
  dateToString,
  type AttendanceSortKey,
  type AttendanceStatus,
  type StudentAttendanceDateSummary,
  type StudentAttendanceDayDetail,
  type StudentAttendanceRow,
} from "./attendanceDefaults";

type StatusFilter = "" | "present" | "absent" | "late" | "leave" | "unmarked";

const StudentAttendance = () => {
  const { auth } = useContext(ThemeContext);
  const canManage = hasPermission(auth, "admin:attendance");

  const today = todayDateString();
  const afterCutoff = isAfterAttendanceCutoff(today);

  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<AttendanceSortKey>("name-asc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [dateSummaries, setDateSummaries] = useState<StudentAttendanceDateSummary[]>([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<StudentAttendanceDayDetail | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<StatusFilter>("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => toDateObject(todayDateString()));

  const loadToday = async () => {
    setLoading(true);
    try {
      const data = await api.getTodayStudentAttendance();
      setRows(data.rows);
      const nextMarks: Record<string, AttendanceStatus> = {};
      data.rows.forEach((row) => {
        const savedStatus = row.status || "";
        if (savedStatus) {
          nextMarks[row.studentOnboardingId] = savedStatus;
        } else if (isAfterAttendanceCutoff(data.date)) {
          nextMarks[row.studentOnboardingId] = "late";
        } else {
          nextMarks[row.studentOnboardingId] = "";
        }
      });
      setMarks(nextMarks);
    } catch (err) {
      notify.error(err, "Failed to load today's attendance.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (preferredDate?: string | null) => {
    setHistoryLoading(true);
    try {
      const summaries = await api.getStudentAttendanceDates();
      setDateSummaries(summaries);

      const nextDate =
        preferredDate && summaries.some((item) => item.date === preferredDate)
          ? preferredDate
          : summaries[0]?.date || null;

      setSelectedHistoryDate(nextDate);
      if (nextDate) {
        const detail = await api.getStudentAttendanceByDate(nextDate);
        setSelectedDayDetail(detail);
      } else {
        setSelectedDayDetail(null);
      }
    } catch (err) {
      notify.error(err, "Failed to load attendance history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const selectHistoryDate = async (date: string) => {
    setSelectedHistoryDate(date);
    setHistoryLoading(true);
    try {
      const detail = await api.getStudentAttendanceByDate(date);
      setSelectedDayDetail(detail);
    } catch (err) {
      notify.error(err, "Failed to load attendance for selected date.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!canManage) return;
    loadToday().catch(console.error);
  }, [canManage]);

  useEffect(() => {
    if (!showHistory || !canManage) return;
    loadHistory(selectedHistoryDate).catch(console.error);
  }, [showHistory, canManage]);

  const highlightedDates = useMemo(
    () => dateSummaries.map((item) => toDateObject(item.date)),
    [dateSummaries]
  );

  const filteredDateSummaries = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    return dateSummaries.filter((item) => {
      if (historyStatusFilter) {
        const count =
          historyStatusFilter === "present"
            ? item.present
            : historyStatusFilter === "absent"
              ? item.absent
              : historyStatusFilter === "late"
                ? item.late
                : historyStatusFilter === "leave"
                  ? item.leave
                  : item.total;
        if (!count) return false;
      }
      if (!query) return true;
      return (
        item.date.includes(query) ||
        formatDisplayDate(item.date).toLowerCase().includes(query)
      );
    });
  }, [dateSummaries, historySearch, historyStatusFilter]);

  const selectedDayRows = useMemo(() => {
    if (!selectedDayDetail) return [];
    let list = selectedDayDetail.rows.filter((row) => row.status);
    if (historyStatusFilter && historyStatusFilter !== "unmarked") {
      list = list.filter((row) => row.status === historyStatusFilter);
    }
    const query = historySearch.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (row) =>
          row.fullName.toLowerCase().includes(query) ||
          row.studentId.toLowerCase().includes(query) ||
          (row.batch || "").toLowerCase().includes(query)
      );
    }
    return sortAttendanceRows(list, "name-asc");
  }, [selectedDayDetail, historySearch, historyStatusFilter]);

  const setStudentStatus = (studentOnboardingId: string, status: Exclude<AttendanceStatus, "">) => {
    const current = marks[studentOnboardingId];
    if (current === status) {
      setMarks((prev) => ({ ...prev, [studentOnboardingId]: "" }));
      return;
    }
    const resolved = resolveMarkStatus(status, today);
    setMarks((prev) => ({ ...prev, [studentOnboardingId]: resolved }));
  };

  const markAllUnmarkedLate = () => {
    if (!afterCutoff) return;
    setMarks((prev) => {
      const next = { ...prev };
      rows.forEach((row) => {
        if (!next[row.studentOnboardingId]) {
          next[row.studentOnboardingId] = "late";
        }
      });
      return next;
    });
  };

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = sortAttendanceRows(rows, sortKey);
    if (query) {
      list = list.filter((row) => {
        return (
          row.fullName.toLowerCase().includes(query) ||
          row.studentId.toLowerCase().includes(query) ||
          (row.batch || "").toLowerCase().includes(query)
        );
      });
    }
    if (statusFilter === "unmarked") {
      list = list.filter((row) => !marks[row.studentOnboardingId]);
    } else if (statusFilter) {
      list = list.filter((row) => marks[row.studentOnboardingId] === statusFilter);
    }
    return list;
  }, [rows, search, sortKey, statusFilter, marks]);

  const markedCount = useMemo(
    () => Object.values(marks).filter((status) => status).length,
    [marks]
  );

  const onSave = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(marks)
        .filter(([, status]) => status)
        .map(([studentOnboardingId, status]) => ({
          studentOnboardingId,
          status: status as Exclude<AttendanceStatus, "">,
        }));

      const data = await api.saveTodayStudentAttendance(entries);
      setRows(data.rows);
      const nextMarks: Record<string, AttendanceStatus> = {};
      data.rows.forEach((row) => {
        nextMarks[row.studentOnboardingId] = row.status || "";
      });
      setMarks(nextMarks);
      notify.success("Today's attendance saved.");
    } catch (err) {
      notify.error(err, "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const onCalendarChange = (value: Date | null) => {
    if (!value) return;
    const date = dateToString(value);
    setCalendarMonth(value);
    if (dateSummaries.some((item) => item.date === date)) {
      selectHistoryDate(date).catch(console.error);
    } else {
      setSelectedHistoryDate(date);
      setSelectedDayDetail(null);
    }
  };

  if (!canManage) {
    return (
      <>
        <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Student Attendance" pageContent="" />
        <div className="alert alert-warning">You do not have permission to manage student attendance.</div>
      </>
    );
  }

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Student Attendance" pageContent="" />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h4 className="card-title mb-1">Student Attendance</h4>
                <p className="text-muted mb-0 small">
                  Today: <strong>{formatDisplayDate(today)}</strong>
                  {afterCutoff && (
                    <span className="text-warning ms-2">After 6:30 PM — new marks default to Late</span>
                  )}
                </p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowHistory((value) => !value)}
                >
                  {showHistory ? "Hide List" : "List"}
                </button>
                {afterCutoff && !showHistory && (
                  <button type="button" className="btn btn-outline-warning btn-sm" onClick={markAllUnmarkedLate}>
                    Mark Unmarked Late
                  </button>
                )}
                {!showHistory && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={onSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Attendance"}
                  </button>
                )}
              </div>
            </div>

            {!showHistory ? (
              <div className="card-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Search by name, student ID, batch..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <select className="form-control" value={sortKey} onChange={(e) => setSortKey(e.target.value as AttendanceSortKey)}>
                      <option value="name-asc">Name (A → Z)</option>
                      <option value="name-desc">Name (Z → A)</option>
                      <option value="id-asc">Student ID (Ascending)</option>
                      <option value="id-desc">Student ID (Descending)</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-control"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    >
                      <option value="">All statuses</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="leave">Leave</option>
                      <option value="unmarked">Not marked</option>
                    </select>
                  </div>
                  <div className="col-md-2 d-flex align-items-center">
                    <span className="text-muted small">
                      {markedCount}/{rows.length} marked
                    </span>
                  </div>
                </div>

                {loading ? (
                  <p className="text-muted mb-0">Loading students...</p>
                ) : filteredRows.length === 0 ? (
                  <p className="text-muted mb-0">No students found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover attendance-table mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Batch</th>
                          <th className="text-center">Present</th>
                          <th className="text-center">Absent</th>
                          <th className="text-center">Late</th>
                          <th className="text-center">Leave</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row, index) => {
                          const currentStatus = marks[row.studentOnboardingId] || "";
                          return (
                            <tr key={row.studentOnboardingId}>
                              <td>{index + 1}</td>
                              <td>{row.studentId}</td>
                              <td>{row.fullName}</td>
                              <td>{row.batch || "—"}</td>
                              {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                                <td key={option.value} className="text-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={currentStatus === option.value}
                                    onChange={() => setStudentStatus(row.studentOnboardingId, option.value)}
                                    aria-label={`${option.label} for ${row.fullName}`}
                                  />
                                </td>
                              ))}
                              <td>
                                <span className={`badge ${statusBadgeClass(currentStatus)}`}>
                                  {currentStatus ? statusLabel(currentStatus) : "Not marked"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {!loading && filteredRows.length > 0 && (
                  <p className="text-muted small mt-3 mb-0">
                    Tip: only one status can be selected per student. After 6:30 PM, choosing Present is saved as Late.
                    Default for new marks after 6:30 PM: {statusLabel(defaultStatusForNewMark(today) || "")}.
                  </p>
                )}
              </div>
            ) : (
              <div className="card-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-5">
                    <input
                      className="form-control"
                      placeholder="Search dates or students..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-control"
                      value={historyStatusFilter}
                      onChange={(e) => setHistoryStatusFilter(e.target.value as StatusFilter)}
                    >
                      <option value="">All statuses</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="leave">Leave</option>
                    </select>
                  </div>
                  <div className="col-md-3 d-flex align-items-center">
                    <span className="text-muted small">{filteredDateSummaries.length} date(s)</span>
                  </div>
                </div>

                {historyLoading && dateSummaries.length === 0 ? (
                  <p className="text-muted mb-0">Loading attendance history...</p>
                ) : (
                  <div className="row g-4">
                    <div className="col-xl-4">
                      <div className="attendance-calendar-panel card border h-100">
                        <div className="card-body">
                          <h6 className="mb-3">Attendance Calendar</h6>
                          <DatePicker
                            inline
                            selected={selectedHistoryDate ? toDateObject(selectedHistoryDate) : null}
                            onChange={onCalendarChange}
                            highlightDates={highlightedDates}
                            openToDate={calendarMonth}
                            onMonthChange={setCalendarMonth}
                            calendarClassName="attendance-inline-calendar"
                          />
                          <p className="text-muted small mt-3 mb-0">
                            Highlighted dates have saved attendance. Click a highlighted date to view details.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-8">
                      <div className="card border h-100">
                        <div className="card-header bg-transparent">
                          <h6 className="mb-0">All Dates</h6>
                        </div>
                        <div className="card-body p-0">
                          {filteredDateSummaries.length === 0 ? (
                            <p className="text-muted p-3 mb-0">No attendance records yet.</p>
                          ) : (
                            <div className="attendance-dates-list">
                              {filteredDateSummaries.map((day) => (
                                <button
                                  key={day.date}
                                  type="button"
                                  className={`attendance-date-item w-100 text-start border-0 ${
                                    selectedHistoryDate === day.date ? "active" : ""
                                  }`}
                                  onClick={() => selectHistoryDate(day.date).catch(console.error)}
                                >
                                  <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                      <strong>{formatDisplayDate(day.date)}</strong>
                                      <div className="text-muted small">{day.date}</div>
                                    </div>
                                    <div className="d-flex flex-wrap gap-1 justify-content-end">
                                      <span className="badge badge-success">P {day.present}</span>
                                      <span className="badge badge-danger">A {day.absent}</span>
                                      <span className="badge badge-warning">L {day.late}</span>
                                      <span className="badge badge-info">Lv {day.leave}</span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="card border">
                        <div className="card-header bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
                          <div>
                            <h6 className="mb-1">Date Details</h6>
                            {selectedHistoryDate ? (
                              <p className="text-muted small mb-0">
                                {formatDisplayDate(selectedHistoryDate)} ({selectedHistoryDate})
                              </p>
                            ) : (
                              <p className="text-muted small mb-0">Select a date from the calendar or list.</p>
                            )}
                          </div>
                          {selectedDayDetail && (
                            <div className="d-flex flex-wrap gap-2 small">
                              <span className="badge badge-success">Present {selectedDayDetail.present}</span>
                              <span className="badge badge-danger">Absent {selectedDayDetail.absent}</span>
                              <span className="badge badge-warning">Late {selectedDayDetail.late}</span>
                              <span className="badge badge-info">Leave {selectedDayDetail.leave}</span>
                            </div>
                          )}
                        </div>
                        <div className="card-body">
                          {historyLoading && selectedHistoryDate ? (
                            <p className="text-muted mb-0">Loading date details...</p>
                          ) : !selectedHistoryDate ? (
                            <p className="text-muted mb-0">Pick a date to view student attendance.</p>
                          ) : !selectedDayDetail || selectedDayDetail.total === 0 ? (
                            <p className="text-muted mb-0">No attendance saved for this date.</p>
                          ) : selectedDayRows.length === 0 ? (
                            <p className="text-muted mb-0">No students match your search or filter.</p>
                          ) : (
                            <div className="table-responsive">
                              <table className="table table-sm table-striped mb-0">
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Batch</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedDayRows.map((row, index) => (
                                    <tr key={row.studentOnboardingId}>
                                      <td>{index + 1}</td>
                                      <td>{row.studentId}</td>
                                      <td>{row.fullName}</td>
                                      <td>{row.batch || "—"}</td>
                                      <td>
                                        <span className={`badge ${statusBadgeClass(row.status)}`}>
                                          {statusLabel(row.status)}
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
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentAttendance;
