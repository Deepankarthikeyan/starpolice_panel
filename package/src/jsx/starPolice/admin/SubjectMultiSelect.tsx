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
    </div>
  );
}
