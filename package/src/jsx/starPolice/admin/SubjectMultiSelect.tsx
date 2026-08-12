/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Subject } from "../types";
// @ts-expect-error package has no TypeScript definitions
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";

type SubjectMultiSelectProps = {
  subjects: Subject[];
  selectedIds: string[];
  onChange: (subjectIds: string[]) => void;
  name: string;
  emptyMessage?: string;
};

export function SubjectMultiSelect({
  subjects,
  selectedIds,
  onChange,
  name,
  emptyMessage = "No subjects found. Add subjects under Master first.",
}: SubjectMultiSelectProps) {
  if (subjects.length === 0) {
    return <p className="text-muted small mb-0">{emptyMessage}</p>;
  }

  const options = subjects.map((subject) => ({ key: subject.id, label: subject.name }));
  const selectedSubjects = subjects.filter((subject) => selectedIds.includes(subject.id));

  const removeSubject = (id: string) => {
    onChange(selectedIds.filter((subjectId) => subjectId !== id));
  };

  return (
    <div className="spa-subject-multiselect">
      <DropdownMultiselect
        name={name}
        options={options}
        selected={selectedIds}
        handleOnChange={(selected: string[]) => onChange(selected)}
        placeholder="Select subjects"
        placeholderMultipleChecked="Multiple subjects selected"
        buttonClass="btn btn-outline-secondary w-100 text-start spa-subject-multiselect-btn"
        selectDeselectLabel="Select / Deselect All"
      />
      <div className="spa-subject-selected-box">
        <p className="spa-subject-selected-label">Selected subjects</p>
        {selectedSubjects.length === 0 ? (
          <p className="text-muted small mb-0">No subjects selected yet.</p>
        ) : (
          <div className="spa-subject-selected-list">
            {selectedSubjects.map((subject) => (
              <span key={subject.id} className="spa-subject-selected-chip">
                {subject.name}
                <button
                  type="button"
                  className="spa-subject-selected-remove"
                  onClick={() => removeSubject(subject.id)}
                  aria-label={`Remove ${subject.name}`}
                >
                  <i className="fa fa-times" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
