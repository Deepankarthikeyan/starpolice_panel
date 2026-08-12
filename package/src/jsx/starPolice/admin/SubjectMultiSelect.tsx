import { useEffect, useRef, useState } from "react";
import type { Subject } from "../types";

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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (subjects.length === 0) {
    return <p className="text-muted small mb-0">{emptyMessage}</p>;
  }

  const selectedSubjects = subjects.filter((subject) => selectedIds.includes(subject.id));

  const toggleSubject = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((subjectId) => subjectId !== id));
      return;
    }
    onChange([...selectedIds, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === subjects.length) {
      onChange([]);
      return;
    }
    onChange(subjects.map((subject) => subject.id));
  };

  const removeSubject = (id: string) => {
    onChange(selectedIds.filter((subjectId) => subjectId !== id));
  };

  const buttonLabel =
    selectedSubjects.length === 0
      ? "Select subjects"
      : selectedSubjects.length === 1
        ? selectedSubjects[0].name
        : "Multiple subjects selected";

  return (
    <div className="spa-subject-multiselect" ref={rootRef}>
      <div className="dropdown w-100">
        <button
          type="button"
          className="btn btn-outline-secondary w-100 text-start spa-subject-multiselect-btn dropdown-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="spa-subject-multiselect-btn-text">{buttonLabel}</span>
        </button>

        {open && (
          <div className="dropdown-menu show w-100 spa-subject-dropdown-menu">
            <button type="button" className="btn btn-sm btn-light w-100 mb-2" onClick={toggleAll}>
              Select / Deselect All
            </button>
            {subjects.map((subject) => (
              <label key={subject.id} className="dropdown-item spa-subject-dropdown-item">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name={`${name}[]`}
                  value={subject.id}
                  checked={selectedIds.includes(subject.id)}
                  onChange={() => toggleSubject(subject.id)}
                />
                <span>{subject.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

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
