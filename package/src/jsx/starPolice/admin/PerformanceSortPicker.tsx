import { useEffect, useRef, useState } from "react";

export type PerformanceSortPickerOption = {
  key: string;
  dir: "asc" | "desc";
  label: string;
};

type PerformanceSortPickerProps = {
  options: PerformanceSortPickerOption[];
  value: string;
  onChange: (value: string) => void;
};

function optionValue(option: PerformanceSortPickerOption) {
  return `${option.key}:${option.dir}`;
}

function sortIcon(key: string) {
  if (key === "overallPercent") return "fa-chart-pie";
  if (key === "attendancePercent") return "fa-calendar-check";
  if (key === "physicalExamPercent") return "fa-running";
  if (key === "writtenExamPercent") return "fa-pen-fancy";
  if (key === "fullName") return "fa-user";
  if (key === "studentId") return "fa-id-card";
  if (key === "batch") return "fa-users";
  return "fa-sort";
}

function directionLabel(dir: "asc" | "desc") {
  return dir === "desc" ? "High → Low" : "Low → High";
}

export function PerformanceSortPicker({ options, value, onChange }: PerformanceSortPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => optionValue(option) === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: PerformanceSortPickerOption) => {
    onChange(optionValue(option));
    setOpen(false);
  };

  return (
    <div className="spa-performance-sort-picker" ref={rootRef}>
      <button
        type="button"
        className={`spa-performance-sort-trigger ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="spa-performance-sort-trigger-icon" aria-hidden="true">
          <i className="fa fa-arrow-down-wide-short" />
        </span>
        <span className="spa-performance-sort-trigger-text">
          <span className="spa-performance-sort-trigger-label">Sort by</span>
          <span className="spa-performance-sort-trigger-value">{selected.label}</span>
        </span>
        <span className="spa-performance-sort-trigger-chevron" aria-hidden="true">
          <i className={`fa fa-chevron-${open ? "up" : "down"}`} />
        </span>
      </button>

      {open && (
        <div className="spa-performance-sort-menu" role="listbox" aria-label="Sort students">
          {options.map((option) => {
            const isActive = optionValue(option) === value;
            const isPercent = option.key.endsWith("Percent");
            return (
              <button
                key={optionValue(option)}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`spa-performance-sort-option ${isActive ? "is-active" : ""}`}
                onClick={() => handleSelect(option)}
              >
                <span className={`spa-performance-sort-option-icon spa-performance-sort-tone-${option.key}`}>
                  <i className={`fa ${sortIcon(option.key)}`} aria-hidden="true" />
                </span>
                <span className="spa-performance-sort-option-body">
                  <span className="spa-performance-sort-option-label">{option.label}</span>
                  {isPercent && (
                    <span className="spa-performance-sort-option-meta">{directionLabel(option.dir)}</span>
                  )}
                </span>
                {isActive && (
                  <span className="spa-performance-sort-option-check" aria-hidden="true">
                    <i className="fa fa-check" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
