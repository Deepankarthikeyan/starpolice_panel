import type { StudentExamMarkEntry } from "../admin/examDefaults";

export function ExamMarksTable({
  title,
  exams,
  onChange,
  readOnly = false,
}: {
  title: string;
  exams: StudentExamMarkEntry[];
  onChange?: (next: StudentExamMarkEntry[]) => void;
  readOnly?: boolean;
}) {
  const setMark = (examId: string, key: "scoredMarks" | "remarks", value: string) => {
    if (!onChange) return;
    onChange(
      exams.map((exam) => (exam.examId === examId ? { ...exam, [key]: value } : exam))
    );
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">
        {exams.length === 0 ? (
          <p className="text-muted mb-0">No exams configured. Add exams under Master → Exams.</p>
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
                      {readOnly ? (
                        exam.scoredMarks === "" || exam.scoredMarks === null || exam.scoredMarks === undefined
                          ? "—"
                          : exam.scoredMarks
                      ) : (
                        <input
                          type="number"
                          min={0}
                          max={exam.totalMarks}
                          className="form-control form-control-sm"
                          value={exam.scoredMarks}
                          onChange={(e) => setMark(exam.examId, "scoredMarks", e.target.value)}
                        />
                      )}
                    </td>
                    <td>
                      {readOnly ? (
                        exam.remarks || "—"
                      ) : (
                        <input
                          className="form-control form-control-sm"
                          value={exam.remarks}
                          onChange={(e) => setMark(exam.examId, "remarks", e.target.value)}
                        />
                      )}
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
