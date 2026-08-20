import { useRef } from "react";

type PerformanceSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PerformanceSearchField({ value, onChange }: PerformanceSearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value.length > 0;

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

      <input
        ref={inputRef}
        type="text"
        className="spa-performance-search-input"
        value={value}
        placeholder=""
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            handleClear();
          }
        }}
        aria-label="Search students"
      />

      {hasValue && (
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
      )}
    </div>
  );
}
