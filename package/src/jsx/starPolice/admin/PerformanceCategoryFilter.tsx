import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

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

function parsePercent(value: string, fallback: number) {
  if (value === "") return fallback;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function DualRangeSlider({
  min,
  max,
  disabled,
  onMinChange,
  onMaxChange,
}: {
  min: string;
  max: string;
  disabled: boolean;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const minVal = parsePercent(min, 0);
  const maxVal = parsePercent(max, 100);

  const setMinValue = (value: number) => {
    const next = Math.min(value, maxVal);
    onMinChange(String(next));
  };

  const setMaxValue = (value: number) => {
    const next = Math.max(value, minVal);
    onMaxChange(String(next));
  };

  const valueFromPointer = (clientX: number) => {
    const rail = railRef.current;
    if (!rail) return 0;
    const rect = rail.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(100, Math.max(0, Math.round(ratio * 100)));
  };

  const handleRailPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || (event.target as HTMLElement).tagName === "INPUT") return;
    const value = valueFromPointer(event.clientX);
    const distanceToMin = Math.abs(value - minVal);
    const distanceToMax = Math.abs(value - maxVal);
    if (distanceToMin <= distanceToMax) {
      setMinValue(value);
    } else {
      setMaxValue(value);
    }
  };

  return (
    <div className={`spa-performance-dual-range ${disabled ? "is-disabled" : ""}`}>
      <div
        ref={railRef}
        className="spa-performance-dual-range-rail"
        onPointerDown={handleRailPointerDown}
      >
        <div
          className="spa-performance-dual-range-fill"
          style={{ left: `${minVal}%`, right: `${100 - maxVal}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={minVal}
          disabled={disabled}
          aria-label="Minimum score percent"
          className="spa-performance-dual-range-input spa-performance-dual-range-input-min"
          onChange={(event) => setMinValue(Number(event.target.value))}
        />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={maxVal}
          disabled={disabled}
          aria-label="Maximum score percent"
          className="spa-performance-dual-range-input spa-performance-dual-range-input-max"
          onChange={(event) => setMaxValue(Number(event.target.value))}
        />
      </div>
      <div className="spa-performance-dual-range-labels">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
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
  const minDisplay = min === "" ? "0" : min;
  const maxDisplay = max === "" ? "100" : max;

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
          <label className="spa-performance-filter-field-label">Show by category</label>
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
          <div className="spa-performance-range-panel-top">
            <label className="spa-performance-filter-field-label">Score range</label>
            {!disabled && (
              <span className="spa-performance-range-panel-value">
                {minDisplay}% – {maxDisplay}%
              </span>
            )}
          </div>

          <DualRangeSlider
            min={min}
            max={max}
            disabled={disabled}
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />

          <div className="spa-performance-range-inputs">
            <label className="spa-performance-range-field" htmlFor="performance-filter-min">
              <span className="spa-performance-filter-field-label">From %</span>
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

            <label className="spa-performance-range-field" htmlFor="performance-filter-max">
              <span className="spa-performance-filter-field-label">To %</span>
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
            Clear
          </button>
        )}
      </div>

      {active && (
        <div className="spa-performance-category-summary">
          <span className="spa-performance-category-summary-badge">{summary}</span>
          <span className="spa-performance-category-summary-count">
            {resultCount} student{resultCount === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </div>
  );
}
