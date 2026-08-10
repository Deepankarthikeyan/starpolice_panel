import type {
  OverallPerformance,
  PerformanceCardType,
  PerformanceEvent,
  StudentPerformanceRecord,
} from "../admin/performanceDefaults";
import {
  getEventDefinitions,
  mergeEventsWithDefaults,
  overallPerformanceLabel,
  OVERALL_PERFORMANCE_OPTIONS,
  type PerformanceEventDefinition,
} from "../admin/performanceDefaults";

interface PhysicalRecordCardProps {
  form: StudentPerformanceRecord;
  readOnly?: boolean;
  onChange?: (next: StudentPerformanceRecord) => void;
}

function setField<K extends keyof StudentPerformanceRecord>(
  form: StudentPerformanceRecord,
  key: K,
  value: StudentPerformanceRecord[K],
  onChange?: (next: StudentPerformanceRecord) => void
) {
  if (!onChange) return;
  onChange({ ...form, [key]: value });
}

function setEventFieldByKey(
  form: StudentPerformanceRecord,
  eventKey: string,
  key: keyof PerformanceEvent,
  value: string,
  onChange?: (next: StudentPerformanceRecord) => void
) {
  if (!onChange) return;
  const events = mergeEventsWithDefaults(form.events).map((event) =>
    event.eventKey === eventKey ? { ...event, [key]: value } : event
  );
  onChange({ ...form, events });
}

function getEventForDefinition(form: StudentPerformanceRecord, definition: PerformanceEventDefinition) {
  return (
    mergeEventsWithDefaults(form.events).find((event) => event.eventKey === definition.eventKey) || {
      eventKey: definition.eventKey,
      performance: definition.benchmark,
      singleStar: "",
      doubleStar: "",
      remarks: "",
    }
  );
}

function eventIcon(eventKey: string) {
  if (eventKey.includes("run") || eventKey.includes("sprint")) return "directions_run";
  if (eventKey.includes("jump")) return "sports_gymnastics";
  if (eventKey.includes("rope")) return "fitness_center";
  if (eventKey.includes("ball") || eventKey.includes("shot")) return "sports_baseball";
  return "sports";
}

export default function PhysicalRecordCard({ form, readOnly = false, onChange }: PhysicalRecordCardProps) {
  const cardType: PerformanceCardType = form.cardType;
  const definitions = getEventDefinitions();
  const studentName = form.student?.fullName || "—";
  const registerNo = form.student?.studentId || "—";
  const batch = form.student?.batch || "—";

  return (
    <div className="physical-record-card">
      <div className="physical-record-header">
        <div>
          <div className="physical-record-academy">STAR POLICE ACADEMY</div>
          <div className="physical-record-subtitle">NO. 1 POLICE ACADEMY IN TAMILNADU · VELLORE</div>
        </div>
        <div className="physical-record-title-wrap">
          <div className="physical-record-title">
            TNUSRB SI &amp; PC PHYSICAL EFFICIENCY RECORD CARD - {form.recordYear}
          </div>
          <div className="physical-record-card-name">STUDENT PHYSICAL RECORD CARD</div>
        </div>
      </div>

      <div className="physical-record-info-grid">
        <div>
          <span className="physical-record-label">Student Name</span>
          {readOnly ? (
            <div className="physical-record-value">{studentName}</div>
          ) : (
            <input className="form-control form-control-sm" value={studentName} readOnly />
          )}
        </div>
        <div>
          <span className="physical-record-label">Register No.</span>
          {readOnly ? (
            <div className="physical-record-value">{registerNo}</div>
          ) : (
            <input className="form-control form-control-sm" value={registerNo} readOnly />
          )}
        </div>
        <div>
          <span className="physical-record-label">Batch</span>
          {readOnly ? (
            <div className="physical-record-value">{batch}</div>
          ) : (
            <input className="form-control form-control-sm" value={batch} readOnly />
          )}
        </div>
        <div>
          <span className="physical-record-label">Age</span>
          {readOnly ? (
            <div className="physical-record-value">{form.age || "—"}</div>
          ) : (
            <input
              className="form-control form-control-sm"
              value={form.age}
              onChange={(e) => setField(form, "age", e.target.value, onChange)}
            />
          )}
        </div>
        <div>
          <span className="physical-record-label">Gender</span>
          <div className="physical-record-value">{form.student?.gender || (cardType === "female" ? "Female" : "Male")}</div>
        </div>
        <div>
          <span className="physical-record-label">Height (cm)</span>
          {readOnly ? (
            <div className="physical-record-value">{form.heightCm || "—"}</div>
          ) : (
            <input
              className="form-control form-control-sm"
              value={form.heightCm}
              onChange={(e) => setField(form, "heightCm", e.target.value, onChange)}
            />
          )}
        </div>
        <div>
          <span className="physical-record-label">Weight (kg)</span>
          {readOnly ? (
            <div className="physical-record-value">{form.weightKg || "—"}</div>
          ) : (
            <input
              className="form-control form-control-sm"
              value={form.weightKg}
              onChange={(e) => setField(form, "weightKg", e.target.value, onChange)}
            />
          )}
        </div>
        <div>
          <span className="physical-record-label">Chest Normal (cm)</span>
          {readOnly ? (
            <div className="physical-record-value">{form.chestNormalCm || "—"}</div>
          ) : (
            <input
              className="form-control form-control-sm"
              value={form.chestNormalCm}
              onChange={(e) => setField(form, "chestNormalCm", e.target.value, onChange)}
            />
          )}
        </div>
        <div>
          <span className="physical-record-label">Chest Expansion (cm)</span>
          {readOnly ? (
            <div className="physical-record-value">{form.chestExpansionCm || "—"}</div>
          ) : (
            <input
              className="form-control form-control-sm"
              value={form.chestExpansionCm}
              onChange={(e) => setField(form, "chestExpansionCm", e.target.value, onChange)}
            />
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table physical-record-table mb-0">
          <thead>
            <tr>
              <th>EVENTS</th>
              <th>PERFORMANCE</th>
              <th className="text-danger">SINGLE STAR</th>
              <th className="text-danger">DOUBLE STAR</th>
              <th>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {definitions.map((definition: PerformanceEventDefinition) => {
              const event = getEventForDefinition(form, definition);

              return (
                <tr key={definition.eventKey}>
                    <td>
                      <div className="physical-record-event">
                        <i className="material-symbols-outlined text-danger">{eventIcon(definition.eventKey)}</i>
                        <span>{definition.label}</span>
                      </div>
                    </td>
                    <td>
                      {readOnly ? (
                        <span>{event.performance || definition.benchmark}</span>
                      ) : (
                        <input
                          className="form-control form-control-sm"
                          value={event.performance}
                          onChange={(e) =>
                            setEventFieldByKey(form, definition.eventKey, "performance", e.target.value, onChange)
                          }
                        />
                      )}
                    </td>
                    <td>
                      {readOnly ? (
                        <span>{event.singleStar || "—"}</span>
                      ) : (
                        <input
                          className="form-control form-control-sm"
                          value={event.singleStar}
                          onChange={(e) =>
                            setEventFieldByKey(form, definition.eventKey, "singleStar", e.target.value, onChange)
                          }
                        />
                      )}
                    </td>
                    <td>
                      {readOnly ? (
                        <span>{event.doubleStar || "—"}</span>
                      ) : (
                        <input
                          className="form-control form-control-sm"
                          value={event.doubleStar}
                          onChange={(e) =>
                            setEventFieldByKey(form, definition.eventKey, "doubleStar", e.target.value, onChange)
                          }
                        />
                      )}
                    </td>
                    <td>
                      {readOnly ? (
                        <span>{event.remarks || "—"}</span>
                      ) : (
                        <input
                          className="form-control form-control-sm"
                          value={event.remarks}
                          onChange={(e) =>
                            setEventFieldByKey(form, definition.eventKey, "remarks", e.target.value, onChange)
                          }
                        />
                      )}
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="physical-record-footer">
        <div className="physical-record-attendance">
          <strong>ATTENDANCE</strong>
          <div className="physical-record-attendance-fields">
            <label>
              Present:
              {readOnly ? (
                <span>{form.attendancePresent || "—"}</span>
              ) : (
                <input
                  className="form-control form-control-sm"
                  value={form.attendancePresent}
                  onChange={(e) => setField(form, "attendancePresent", e.target.value, onChange)}
                />
              )}
            </label>
            <label>
              Absent:
              {readOnly ? (
                <span>{form.attendanceAbsent || "—"}</span>
              ) : (
                <input
                  className="form-control form-control-sm"
                  value={form.attendanceAbsent}
                  onChange={(e) => setField(form, "attendanceAbsent", e.target.value, onChange)}
                />
              )}
            </label>
            <label>
              Leave:
              {readOnly ? (
                <span>{form.attendanceLeave || "—"}</span>
              ) : (
                <input
                  className="form-control form-control-sm"
                  value={form.attendanceLeave}
                  onChange={(e) => setField(form, "attendanceLeave", e.target.value, onChange)}
                />
              )}
            </label>
          </div>
        </div>

        <div className="physical-record-overall">
          <strong>OVERALL PERFORMANCE</strong>
          <div className="physical-record-overall-options">
            {OVERALL_PERFORMANCE_OPTIONS.map((option) => (
              <label key={option.value} className="physical-record-checkbox">
                <input
                  type="radio"
                  name="overallPerformance"
                  checked={form.overallPerformance === option.value}
                  disabled={readOnly}
                  onChange={() => setField(form, "overallPerformance", option.value as OverallPerformance, onChange)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {readOnly && form.overallPerformance && (
            <div className="mt-2">
              <span className="badge badge-primary">{overallPerformanceLabel(form.overallPerformance)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="physical-record-remarks">
        <strong>Trainer Remarks</strong>
        {readOnly ? (
          <p className="mb-0">{form.trainerRemarks || "—"}</p>
        ) : (
          <textarea
            className="form-control"
            rows={2}
            value={form.trainerRemarks}
            onChange={(e) => setField(form, "trainerRemarks", e.target.value, onChange)}
          />
        )}
      </div>

      <div className="physical-record-signature">Physical Director</div>
    </div>
  );
}
