import { useEffect, useRef, useState } from "react";

export type PerformanceCategoryFilterOption = {
  value: string;
  label: string;
};

type PerformanceCategoryFilterProps = {
  options: PerformanceCategoryFilterOption[];
  category: string;
  min: string;
  max: string;
  active: boolean;
  summary: string;
  resultCount: number;
  onCategoryChange: (value: string) => void;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  onClear: () => void;
};

function categoryIcon(value: string) {
  if (value === "attendancePercent") return "fa-calendar-check";
  if (value === "physicalExamPercent") return "fa-running";
  if (value === "writtenExamPercent") return "fa-pen-fancy";
  if (value === "overallPercent") return "fa-chart-pie";
  return "fa-layer-group";
}

function categoryTone(value: string) {
  if (!value) return "none";
  return value;
}

function clampPercent(value: string, fallback: number) {
  if (value === "") return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return Math.min(100, Math.max(0, num));
}

export function PerformanceCategoryFilter({
  options,
  category,
  min,
  max,
  active,
  summary,
  resultCount,
  onCategoryChange,
  onMinChange,
  onMaxChange,
  onClear,
}: PerformanceCategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === category) ?? options[0];
  const disabled = !category;

  const minNum = clampPercent(min, 0);
  const maxNum = clampPercent(max, 100);
  const rangeStart = Math.min(minNum, maxNum);
  const rangeEnd = Math.max(minNum, maxNum);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="spa-performance-category-filter spa-no-print">
      <div className="spa-performance-category-filter-body">
        <div className="spa-performance-category-picker-wrap" ref={rootRef}>
          <label className="spa-performance-category-picker-label">Show by category</label>
          <button
            type="button"
            className={`spa-performance-category-trigger ${open ? "is-open" : ""}`}
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((current) => !current)}
          >
            <span
              className={`spa-performance-category-trigger-icon spa-performance-sort-tone-${categoryTone(category)}`}
            >
              <i className={`fa ${categoryIcon(category)}`} aria-hidden="true" />
            </span>
            <span className="spa-performance-category-trigger-value">{selected.label}</span>
            <span className="spa-performance-category-trigger-chevron" aria-hidden="true">
              <i className={`fa fa-chevron-${open ? "up" : "down"}`} />
            </span>
          </button>

          {open && (
            <div className="spa-performance-category-menu" role="listbox" aria-label="Filter category">
              {options.map((option) => {
                const isActive = option.value === category;
                return (
                  <button
                    key={option.value || "all"}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`spa-performance-category-option ${isActive ? "is-active" : ""}`}
                    onClick={() => {
                      onCategoryChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span
                      className={`spa-performance-sort-option-icon spa-performance-sort-tone-${categoryTone(option.value)}`}
                    >
                      <i className={`fa ${categoryIcon(option.value)}`} aria-hidden="true" />
                    </span>
                    <span className="spa-performance-category-option-label">{option.label}</span>
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

        <div className={`spa-performance-range-panel ${disabled ? "is-disabled" : ""}`}>
          <div className="spa-performance-range-panel-head">
            <span className="spa-performance-range-panel-label">Score range</span>
            {!disabled && (
              <span className="spa-performance-range-panel-value">
                {min === "" ? "0" : min}% – {max === "" ? "100" : max}%
              </span>
            )}
          </div>

          <div className="spa-performance-range-track-wrap" aria-hidden="true">
            <div className="spa-performance-range-track">
              <span
                className="spa-performance-range-track-fill"
                style={{
                  left: `${rangeStart}%`,
                  right: `${100 - rangeEnd}%`,
                }}
              />
            </div>
            <div className="spa-performance-range-track-labels">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="spa-performance-range-inputs">
            <label className="spa-performance-range-field" htmlFor="performance-filter-min">
              <span className="spa-performance-range-field-label">From %</span>
              <span className="spa-performance-range-field-input-wrap">
                <input
                  id="performance-filter-min"
                  type="number"
                  min={0}
                  max={100}
                  className="spa-performance-range-field-input"
                  placeholder="10"
                  value={min}
                  onChange={(event) => onMinChange(event.target.value)}
                  disabled={disabled}
                />
                <span className="spa-performance-range-field-suffix">%</span>
              </span>
            </label>

            <span className="spa-performance-range-divider" aria-hidden="true">
              <i className="fa fa-arrow-right" />
            </span>

            <label className="spa-performance-range-field" htmlFor="performance-filter-max">
              <span className="spa-performance-range-field-label">To %</span>
              <span className="spa-performance-range-field-input-wrap">
                <input
                  id="performance-filter-max"
                  type="number"
                  min={0}
                  max={100}
                  className="spa-performance-range-field-input"
                  placeholder="30"
                  value={max}
                  onChange={(event) => onMaxChange(event.target.value)}
                  disabled={disabled}
                />
                <span className="spa-performance-range-field-suffix">%</span>
              </span>
            </label>
          </div>
        </div>

        {active && (
          <button type="button" className="spa-performance-category-clear" onClick={onClear}>
            <i className="fa fa-times me-1" aria-hidden="true" />
            Clear range
          </button>
        )}
      </div>

      {active && (
        <div className="spa-performance-category-summary">
          <span className="spa-performance-category-summary-badge">
            <i className="fa fa-filter me-1" aria-hidden="true" />
            {summary}
          </span>
          <span className="spa-performance-category-summary-count">
            {resultCount} student{resultCount === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </div>
  );
}
