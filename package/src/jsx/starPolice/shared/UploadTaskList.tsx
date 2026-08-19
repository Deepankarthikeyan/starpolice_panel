import { useLocation } from "react-router-dom";
import { useSyncExternalStore } from "react";
import {
  cancelUpload,
  getUploadJobs,
  getVisibleUploadJobs,
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
  const percent = Math.max(0, Math.min(100, Math.round(job.percent)));
  const isError = job.status === "error";
  const label =
    job.status === "queued"
      ? "Waiting..."
      : job.status === "uploading"
        ? `Uploading ${percent}%`
        : isError
          ? job.error || "Upload failed"
          : "Uploaded";

  return (
    <div className={`spa-upload-task${isError ? " is-error" : ""}`}>
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
        <button
          type="button"
          className="spa-upload-task-close"
          aria-label={`Cancel upload ${job.name}`}
          onClick={() => cancelUpload(job.id)}
        >
          ×
        </button>
      </div>
      <div className="progress spa-upload-task-bar">
        <div
          className={`progress-bar progress-bar-striped${job.status === "uploading" ? " progress-bar-animated" : ""}${
            isError ? " bg-danger" : ""
          }`}
          role="progressbar"
          style={{ width: `${isError ? 100 : percent}%` }}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
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
