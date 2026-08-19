import { useLocation } from "react-router-dom";
import { useState, useSyncExternalStore } from "react";
import {
  cancelUpload,
  getUploadJobs,
  getVisibleUploadJobs,
  pauseUpload,
  resumeUpload,
  subscribeUploadQueue,
  type UploadJob,
} from "../uploads/uploadQueueStore";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function useUploadJobs() {
  return useSyncExternalStore(subscribeUploadQueue, getUploadJobs, getUploadJobs);
}

export function useVisibleUploadJobs() {
  return useSyncExternalStore(subscribeUploadQueue, getVisibleUploadJobs, getVisibleUploadJobs);
}

export function UploadTaskRow({ job }: { job: UploadJob }) {
  const [confirming, setConfirming] = useState(false);
  const width = Math.max(0, Math.min(100, job.percent));
  const percent = Math.round(width);
  const isError = job.status === "error";
  const isPaused = job.status === "paused";
  const canPause = !confirming && (job.status === "uploading" || job.status === "queued");
  const canResume = !confirming && (isPaused || isError);
  const label =
    job.status === "queued"
      ? "Waiting..."
      : job.status === "uploading"
        ? width >= 100
          ? "Saving..."
          : `Uploading ${percent}%`
        : isPaused
          ? `Paused ${percent}%`
          : isError
            ? job.error || "Upload failed"
            : "Uploaded";

  return (
    <div className={`spa-upload-task${isError ? " is-error" : ""}${isPaused ? " is-paused" : ""}`}>
      <div className="spa-upload-task-top">
        <div className="spa-upload-task-copy">
          <div className="spa-upload-task-name" title={job.name}>
            {job.name}
          </div>
          <div className="spa-upload-task-meta">
            {label}
            <span className="spa-upload-task-dot">·</span>
            {formatSize(job.size)}
          </div>
        </div>
        {!confirming && (
          <div className="spa-upload-task-actions">
            {canPause && (
              <button
                type="button"
                className="spa-upload-task-btn"
                aria-label={`Pause upload ${job.name}`}
                title="Pause"
                onClick={() => pauseUpload(job.id)}
              >
                <i className="fa fa-pause" aria-hidden="true" />
              </button>
            )}
            {canResume && (
              <button
                type="button"
                className="spa-upload-task-btn"
                aria-label={`Resume upload ${job.name}`}
                title="Resume"
                onClick={() => resumeUpload(job.id)}
              >
                <i className="fa fa-play" aria-hidden="true" />
              </button>
            )}
            {job.status !== "success" && (
              <button
                type="button"
                className="spa-upload-task-btn spa-upload-task-close"
                aria-label={`Cancel upload ${job.name}`}
                title="Cancel"
                onClick={() => setConfirming(true)}
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>
      {confirming ? (
        <div className="spa-upload-task-confirm">
          <span>Cancel this upload?</span>
          <div className="spa-upload-task-confirm-actions">
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => {
                setConfirming(false);
                cancelUpload(job.id);
              }}
            >
              Yes
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setConfirming(false)}>
              No
            </button>
          </div>
        </div>
      ) : (
        <div className="progress spa-upload-task-bar">
          <div
            className={`progress-bar progress-bar-striped${job.status === "uploading" && width < 100 ? " progress-bar-animated" : ""}${
              isError ? " bg-danger" : ""
            }`}
            role="progressbar"
            style={{ width: `${isError ? 100 : width}%` }}
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  );
}

export function UploadTaskList({ jobs }: { jobs: UploadJob[] }) {
  if (jobs.length === 0) return null;

  return (
    <div className="spa-upload-task-list" aria-live="polite">
      {jobs.map((job) => (
        <UploadTaskRow key={job.id} job={job} />
      ))}
    </div>
  );
}

export function UploadQueueTray() {
  const location = useLocation();
  const jobs = useVisibleUploadJobs();
  const onUploadPage = /\/(admin|staff)\/daywise-upload\/?$/.test(location.pathname);
  if (onUploadPage || jobs.length === 0) return null;

  return (
    <div className="spa-upload-tray" aria-live="polite">
      <div className="spa-upload-tray-header">Uploading {jobs.length} file{jobs.length === 1 ? "" : "s"}</div>
      <UploadTaskList jobs={jobs} />
    </div>
  );
}
