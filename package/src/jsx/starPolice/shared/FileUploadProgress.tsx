const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type FileUploadProgressProps = {
  percent: number;
  fileCount: number;
  fileNames?: string[];
};

export function FileUploadProgress({ percent, fileCount, fileNames = [] }: FileUploadProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const finishing = clamped >= 100;
  const shownNames = fileNames.slice(0, 4);
  const extraCount = fileNames.length - shownNames.length;

  return (
    <div className="spa-upload-progress" aria-live="polite" role="status">
      <div className="spa-upload-progress-ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="spa-upload-progress-track" cx="60" cy="60" r={RING_RADIUS} />
          <circle
            className="spa-upload-progress-fill"
            cx="60"
            cy="60"
            r={RING_RADIUS}
            style={{
              strokeDasharray: RING_CIRCUMFERENCE,
              strokeDashoffset: RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * clamped) / 100,
            }}
          />
        </svg>
        <span className="spa-upload-progress-percent">{clamped}%</span>
      </div>
      <p className="spa-upload-progress-title mb-1">
        {finishing ? "Finishing upload..." : "Uploading files..."}
      </p>
      <p className="spa-upload-progress-meta text-muted small mb-3">
        {fileCount} file{fileCount === 1 ? "" : "s"}
      </p>
      {shownNames.length > 0 && (
        <ul className="spa-upload-progress-files">
          {shownNames.map((name, index) => (
            <li key={`${index}-${name}`} title={name}>
              {name}
            </li>
          ))}
          {extraCount > 0 && <li>+{extraCount} more</li>}
        </ul>
      )}
      <div className="progress spa-upload-progress-bar">
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          style={{ width: `${clamped}%` }}
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export function FileUploadProgressOverlay(props: FileUploadProgressProps) {
  return (
    <div className="spa-upload-overlay">
      <div className="spa-upload-overlay-card">
        <FileUploadProgress {...props} />
      </div>
    </div>
  );
}
