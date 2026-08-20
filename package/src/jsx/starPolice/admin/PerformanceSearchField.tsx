import { useRef } from "react";

type PerformanceSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PerformanceSearchField({
  value,
  onChange,
}: PerformanceSearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value.trim().length > 0;

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={`spa-performance-search-field ${hasValue ? "has-value" : ""}`}
      onClick={() => inputRef.current?.focus()}
    >
      <span className="spa-performance-search-icon" aria-hidden="true">
        <i className="fa fa-magnifying-glass" />
      </span>

      <span className="spa-performance-search-body">
        <span className="spa-performance-search-label">Find student</span>
        <input
          ref={inputRef}
          type="search"
          className="spa-performance-search-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              handleClear();
            }
          }}
          aria-label="Find student by name, register number, or batch"
        />
      </span>

      {hasValue ? (
        <button
          type="button"
          className="spa-performance-search-clear"
          aria-label="Clear search"
          onClick={(event) => {
            event.stopPropagation();
            handleClear();
          }}
        >
          <i className="fa fa-xmark" aria-hidden="true" />
        </button>
      ) : (
        <span className="spa-performance-search-hints" aria-hidden="true">
          <span className="spa-performance-search-hint">Name</span>
          <span className="spa-performance-search-hint">Reg. No.</span>
          <span className="spa-performance-search-hint">Batch</span>
        </span>
      )}
    </div>
  );
}
