import type { ChangeEvent } from "react";

export type PerformanceSortKey =
  | "studentId"
  | "fullName"
  | "batch"
  | "attendancePercent"
  | "physicalExamPercent"
  | "writtenExamPercent"
  | "overallPercent";

export type PerformanceSortDir = "asc" | "desc";

export type PerformancePercentFilterKey =
  | "attendancePercent"
  | "physicalExamPercent"
  | "writtenExamPercent"
  | "overallPercent";

export type PerformanceLensId =
  | "elite"
  | "on_track"
  | "focus"
  | "needs_support"
  | "attendance_heroes"
  | "physical_stars"
  | "written_leaders";

type LensPreset = {
  id: PerformanceLensId;
  label: string;
  hint: string;
  icon: string;
  tone: string;
  filterKey: PerformancePercentFilterKey;
  min: number;
  max: number;
  sortKey: PerformanceSortKey;
  sortDir: PerformanceSortDir;
};

type CategoryOption = {
  value: PerformancePercentFilterKey;
  label: string;
  shortLabel: string;
  icon: string;
};

type RangeBand = {
  id: string;
  label: string;
  min: number;
  max: number;
};

type SortMetric = {
  key: PerformanceSortKey;
  label: string;
  icon: string;
  percent: boolean;
};

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "overallPercent", label: "Overall", shortLabel: "Overall", icon: "fa-chart-pie" },
  { value: "attendancePercent", label: "Attendance", shortLabel: "Attendance", icon: "fa-calendar-check" },
  { value: "physicalExamPercent", label: "Physical exam", shortLabel: "Physical", icon: "fa-running" },
  { value: "writtenExamPercent", label: "Written exam", shortLabel: "Written", icon: "fa-pen-fancy" },
];

const RANGE_BANDS: RangeBand[] = [
  { id: "band_90", label: "90%+ Elite", min: 90, max: 100 },
  { id: "band_75", label: "75–89% Strong", min: 75, max: 89 },
  { id: "band_60", label: "60–74% Steady", min: 60, max: 74 },
  { id: "band_low", label: "Below 60%", min: 0, max: 59 },
  { id: "custom", label: "Custom band", min: 0, max: 100 },
];

const SORT_METRICS: SortMetric[] = [
  { key: "overallPercent", label: "Overall", icon: "fa-star", percent: true },
  { key: "attendancePercent", label: "Attendance", icon: "fa-calendar-check", percent: true },
  { key: "physicalExamPercent", label: "Physical", icon: "fa-running", percent: true },
  { key: "writtenExamPercent", label: "Written", icon: "fa-pen-fancy", percent: true },
  { key: "fullName", label: "Name", icon: "fa-user", percent: false },
  { key: "studentId", label: "Register no.", icon: "fa-id-card", percent: false },
  { key: "batch", label: "Batch", icon: "fa-users", percent: false },
];

export const PERFORMANCE_LENS_PRESETS: LensPreset[] = [
  {
    id: "elite",
    label: "Elite cohort",
    hint: "Overall 90%+",
    icon: "fa-crown",
    tone: "gold",
    filterKey: "overallPercent",
    min: 90,
    max: 100,
    sortKey: "overallPercent",
    sortDir: "desc",
  },
  {
    id: "on_track",
    label: "On track",
    hint: "Overall 75–89%",
    icon: "fa-arrow-trend-up",
    tone: "teal",
    filterKey: "overallPercent",
    min: 75,
    max: 89,
    sortKey: "overallPercent",
    sortDir: "desc",
  },
  {
    id: "focus",
    label: "Focus list",
    hint: "Overall 60–74%",
    icon: "fa-bullseye",
    tone: "amber",
    filterKey: "overallPercent",
    min: 60,
    max: 74,
    sortKey: "overallPercent",
    sortDir: "desc",
  },
  {
    id: "needs_support",
    label: "Needs support",
    hint: "Overall below 60%",
    icon: "fa-life-ring",
    tone: "rose",
    filterKey: "overallPercent",
    min: 0,
    max: 59,
    sortKey: "overallPercent",
    sortDir: "asc",
  },
  {
    id: "attendance_heroes",
    label: "Attendance heroes",
    hint: "Attendance 95%+",
    icon: "fa-calendar-check",
    tone: "sky",
    filterKey: "attendancePercent",
    min: 95,
    max: 100,
    sortKey: "attendancePercent",
    sortDir: "desc",
  },
  {
    id: "physical_stars",
    label: "Physical stars",
    hint: "Physical 80%+",
    icon: "fa-medal",
    tone: "violet",
    filterKey: "physicalExamPercent",
    min: 80,
    max: 100,
    sortKey: "physicalExamPercent",
    sortDir: "desc",
  },
  {
    id: "written_leaders",
    label: "Written leaders",
    hint: "Written 80%+",
    icon: "fa-book-open",
    tone: "indigo",
    filterKey: "writtenExamPercent",
    min: 80,
    max: 100,
    sortKey: "writtenExamPercent",
    sortDir: "desc",
  },
];

function categoryLabel(key: PerformancePercentFilterKey | "") {
  return CATEGORY_OPTIONS.find((option) => option.value === key)?.label ?? "Performance";
}

function activeRangeBandId(
  key: PerformancePercentFilterKey | "",
  min: string,
  max: string
): string | null {
  if (!key || (min === "" && max === "")) return null;
  const minNum = min === "" ? 0 : Number(min);
  const maxNum = max === "" ? 100 : Number(max);
  const match = RANGE_BANDS.find(
    (band) => band.id !== "custom" && band.min === minNum && band.max === maxNum
  );
  return match?.id ?? "custom";
}

type PerformanceOverviewControlsProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sortKey: PerformanceSortKey;
  sortDir: PerformanceSortDir;
  onSortKeyChange: (key: PerformanceSortKey) => void;
  onSortDirChange: (dir: PerformanceSortDir) => void;
  percentFilterKey: PerformancePercentFilterKey | "";
  percentMin: string;
  percentMax: string;
  onPercentFilterKeyChange: (key: PerformancePercentFilterKey | "") => void;
  onPercentMinChange: (value: string) => void;
  onPercentMaxChange: (value: string) => void;
  onClearPercentFilter: () => void;
  onResetAll: () => void;
  activeLensId: PerformanceLensId | "";
  onLensSelect: (lens: LensPreset) => void;
  onLensClear: () => void;
  resultCount: number;
  totalCount: number;
};

export function PerformanceOverviewControls({
  search,
  onSearchChange,
  sortKey,
  sortDir,
  onSortKeyChange,
  onSortDirChange,
  percentFilterKey,
  percentMin,
  percentMax,
  onPercentFilterKeyChange,
  onPercentMinChange,
  onPercentMaxChange,
  onClearPercentFilter,
  onResetAll,
  activeLensId,
  onLensSelect,
  onLensClear,
  resultCount,
  totalCount,
}: PerformanceOverviewControlsProps) {
  const percentFilterActive =
    Boolean(percentFilterKey) && (percentMin !== "" || percentMax !== "");
  const hasSearch = search.trim().length > 0;
  const hasActiveControls = percentFilterActive || hasSearch || Boolean(activeLensId);
  const selectedBandId = activeRangeBandId(percentFilterKey, percentMin, percentMax);
  const customBandActive = selectedBandId === "custom" && percentFilterActive;
  const activeMetric = SORT_METRICS.find((metric) => metric.key === sortKey);
  const sortDirLabel = activeMetric?.percent
    ? sortDir === "desc"
      ? "Highest first"
      : "Lowest first"
    : sortDir === "asc"
      ? "A → Z"
      : "Z → A";

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
    if (activeLensId) onLensClear();
  };

  const handleCategorySelect = (key: PerformancePercentFilterKey) => {
    onLensClear();
    onPercentFilterKeyChange(key);
    if (!percentMin && !percentMax) {
      onPercentMinChange("0");
      onPercentMaxChange("100");
    }
  };

  const handleBandSelect = (band: RangeBand) => {
    const category = percentFilterKey || "overallPercent";
    onLensClear();
    onPercentFilterKeyChange(category);
    onPercentMinChange(String(band.min));
    onPercentMaxChange(String(band.max));
  };

  const handleSortMetricClick = (metric: SortMetric) => {
    if (sortKey === metric.key) {
      onSortDirChange(sortDir === "asc" ? "desc" : "asc");
      return;
    }
    onSortKeyChange(metric.key);
    onSortDirChange(metric.percent ? "desc" : "asc");
  };

  const filterSummary = percentFilterActive
    ? `${categoryLabel(percentFilterKey)} · ${percentMin === "" ? "0" : percentMin}% – ${percentMax === "" ? "100" : percentMax}%`
    : "";

  return (
    <div className="spa-performance-command spa-no-print">
      <div className="spa-performance-command-header">
        <div>
          <p className="spa-performance-command-title mb-1">Explore performance</p>
          <p className="spa-performance-command-subtitle mb-0">
            Use quick lenses, score bands, and smart sort — no more long dropdown lists.
          </p>
        </div>
        <div className="spa-performance-command-stats">
          <span className="spa-performance-stat-pill">
            Showing <strong>{resultCount}</strong> of {totalCount}
          </span>
        </div>
      </div>

      <div className="spa-performance-search-wrap">
        <i className="fa fa-search spa-performance-search-icon" aria-hidden="true" />
        <input
          type="search"
          className="form-control spa-performance-search-input"
          placeholder="Search name, register no., batch..."
          value={search}
          onChange={handleSearchChange}
          aria-label="Search students"
        />
        {hasSearch && (
          <button
            type="button"
            className="btn btn-sm btn-link spa-performance-search-clear"
            onClick={() => onSearchChange("")}
          >
            Clear
          </button>
        )}
      </div>

      <div className="spa-performance-command-block">
        <p className="spa-performance-block-label">
          <i className="fa fa-wand-magic-sparkles me-1" aria-hidden="true" />
          Quick lenses
        </p>
        <div className="spa-performance-lens-grid">
          {PERFORMANCE_LENS_PRESETS.map((lens) => (
            <button
              key={lens.id}
              type="button"
              className={`spa-performance-lens-card spa-performance-lens-${lens.tone} ${
                activeLensId === lens.id ? "is-active" : ""
              }`}
              onClick={() => onLensSelect(lens)}
              aria-pressed={activeLensId === lens.id}
            >
              <span className="spa-performance-lens-icon" aria-hidden="true">
                <i className={`fa ${lens.icon}`} />
              </span>
              <span className="spa-performance-lens-text">
                <span className="spa-performance-lens-title">{lens.label}</span>
                <span className="spa-performance-lens-hint">{lens.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="spa-performance-command-row">
        <div className="spa-performance-command-block spa-performance-command-block-grow">
          <p className="spa-performance-block-label">
            <i className="fa fa-sort-amount-down me-1" aria-hidden="true" />
            Smart sort
          </p>
          <div className="spa-performance-sort-chips">
            {SORT_METRICS.map((metric) => {
              const isActive = sortKey === metric.key;
              const arrow = isActive ? (sortDir === "desc" ? "↓" : "↑") : "";
              return (
                <button
                  key={metric.key}
                  type="button"
                  className={`spa-performance-sort-chip ${isActive ? "is-active" : ""}`}
                  onClick={() => handleSortMetricClick(metric)}
                  aria-pressed={isActive}
                >
                  <i className={`fa ${metric.icon} me-1`} aria-hidden="true" />
                  {metric.label}
                  {arrow && <span className="spa-performance-sort-arrow">{arrow}</span>}
                </button>
              );
            })}
          </div>
          <p className="spa-performance-sort-hint mb-0">
            Tap the same metric again to flip direction · Currently{" "}
            <strong>{activeMetric?.label ?? "—"}</strong> ({sortDirLabel})
          </p>
        </div>

        <div className="spa-performance-command-block spa-performance-range-panel">
          <p className="spa-performance-block-label">
            <i className="fa fa-sliders me-1" aria-hidden="true" />
            Score band filter
          </p>
          <div className="spa-performance-category-chips">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`spa-performance-category-chip ${
                  percentFilterKey === option.value ? "is-active" : ""
                }`}
                onClick={() => handleCategorySelect(option.value)}
                aria-pressed={percentFilterKey === option.value}
              >
                <i className={`fa ${option.icon} me-1`} aria-hidden="true" />
                {option.shortLabel}
              </button>
            ))}
          </div>

          <div className="spa-performance-band-chips">
            {RANGE_BANDS.map((band) => (
              <button
                key={band.id}
                type="button"
                className={`spa-performance-band-chip ${
                  selectedBandId === band.id && percentFilterKey ? "is-active" : ""
                }`}
                onClick={() => handleBandSelect(band)}
              >
                {band.label}
              </button>
            ))}
          </div>

          {(customBandActive || (percentFilterKey && selectedBandId === "custom")) && (
            <div className="spa-performance-custom-range">
              <div className="spa-performance-range-track" aria-hidden="true">
                <span
                  className="spa-performance-range-fill"
                  style={{
                    left: `${percentMin === "" ? 0 : Number(percentMin)}%`,
                    right: `${100 - (percentMax === "" ? 100 : Number(percentMax))}%`,
                  }}
                />
              </div>
              <div className="row g-2 align-items-center">
                <div className="col-5">
                  <label className="form-label spa-performance-filter-label" htmlFor="performance-filter-min">
                    From %
                  </label>
                  <input
                    id="performance-filter-min"
                    type="number"
                    min={0}
                    max={100}
                    className="form-control form-control-sm"
                    placeholder="10"
                    value={percentMin}
                    onChange={(event) => {
                      onLensClear();
                      onPercentMinChange(event.target.value);
                    }}
                  />
                </div>
                <div className="col-5">
                  <label className="form-label spa-performance-filter-label" htmlFor="performance-filter-max">
                    To %
                  </label>
                  <input
                    id="performance-filter-max"
                    type="number"
                    min={0}
                    max={100}
                    className="form-control form-control-sm"
                    placeholder="30"
                    value={percentMax}
                    onChange={(event) => {
                      onLensClear();
                      onPercentMaxChange(event.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasActiveControls && (
        <div className="spa-performance-active-bar">
          <span className="spa-performance-active-label">Active view</span>
          <div className="spa-performance-active-chips">
            {activeLensId && (
              <span className="spa-performance-active-chip">
                Lens: {PERFORMANCE_LENS_PRESETS.find((l) => l.id === activeLensId)?.label}
                <button type="button" className="spa-performance-active-remove" onClick={onLensClear}>
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              </span>
            )}
            {percentFilterActive && (
              <span className="spa-performance-active-chip">
                {filterSummary}
                <button type="button" className="spa-performance-active-remove" onClick={onClearPercentFilter}>
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              </span>
            )}
            {hasSearch && (
              <span className="spa-performance-active-chip">
                Search: “{search.trim()}”
                <button
                  type="button"
                  className="spa-performance-active-remove"
                  onClick={() => onSearchChange("")}
                >
                  <i className="fa fa-times" aria-hidden="true" />
                </button>
              </span>
            )}
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onResetAll}>
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
