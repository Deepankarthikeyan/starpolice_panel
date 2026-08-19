import { api } from "../api";
import { notify } from "../toast";
import {
  deletePendingUpload,
  loadPendingUploads,
  savePendingUpload,
  type PersistedUploadJob,
} from "./pendingUploadDb";

export const SPA_UPLOAD_COMPLETE_EVENT = "spa-upload-complete";

export type UploadJobStatus = "queued" | "uploading" | "paused" | "success" | "error";

export type UploadJob = {
  id: string;
  name: string;
  size: number;
  date: string;
  category: string;
  title: string;
  percent: number;
  status: UploadJobStatus;
  error?: string;
};

type JobAction = "none" | "cancel" | "pause";

type InternalJob = UploadJob & {
  file: File;
  abort?: AbortController;
  action: JobAction;
  createdAt: number;
};

const MAX_CONCURRENT = 3;
const listeners = new Set<() => void>();
const jobs = new Map<string, InternalJob>();
const jobOrder: string[] = [];
let snapshot: UploadJob[] = [];
let visibleSnapshot: UploadJob[] = [];
let restoring = false;

function toPublicJob(job: InternalJob): UploadJob {
  return {
    id: job.id,
    name: job.name,
    size: job.size,
    date: job.date,
    category: job.category,
    title: job.title,
    percent: job.percent,
    status: job.status,
    error: job.error,
  };
}

function emit() {
  snapshot = jobOrder
    .map((id) => jobs.get(id))
    .filter((job): job is InternalJob => Boolean(job))
    .map(toPublicJob);
  visibleSnapshot = snapshot;
  listeners.forEach((listener) => listener());
}

function activeCount() {
  return [...jobs.values()].filter((job) => job.status === "uploading").length;
}

export function subscribeUploadQueue(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUploadJobs() {
  return snapshot;
}

export function getVisibleUploadJobs() {
  return visibleSnapshot;
}

function removeJob(id: string) {
  jobs.delete(id);
  const index = jobOrder.indexOf(id);
  if (index >= 0) jobOrder.splice(index, 1);
}

async function persistJob(job: InternalJob) {
  const payload: PersistedUploadJob = {
    id: job.id,
    name: job.name,
    type: job.file.type,
    lastModified: job.file.lastModified,
    size: job.size,
    date: job.date,
    category: job.category,
    title: job.title,
    blob: job.file,
    createdAt: job.createdAt,
    status: job.status === "paused" ? "paused" : "queued",
    percent: job.percent,
  };
  try {
    await savePendingUpload(payload);
  } catch (err) {
    console.error("Failed to persist upload for resume", err);
  }
}

async function startJob(job: InternalJob) {
  if (job.status !== "queued") return;

  job.status = "uploading";
  job.action = "none";
  job.percent = Math.max(job.percent, 1);
  job.abort = new AbortController();
  emit();

  try {
    await api.uploadFile(job.date, job.category, job.title, job.file, {
      onProgress: (percent) => {
        const current = jobs.get(job.id);
        if (!current || current.status !== "uploading") return;
        current.percent = percent;
        emit();
      },
      signal: job.abort.signal,
    });

    const current = jobs.get(job.id);
    if (!current) return;
    current.status = "success";
    current.percent = 100;
    current.abort = undefined;
    emit();
    await deletePendingUpload(job.id);
    window.dispatchEvent(
      new CustomEvent(SPA_UPLOAD_COMPLETE_EVENT, { detail: { date: job.date } })
    );
    notify.success(`${job.name} uploaded successfully.`);
    window.setTimeout(() => {
      if (jobs.get(job.id)?.status === "success") {
        removeJob(job.id);
        emit();
      }
    }, 1200);
  } catch (err) {
    const current = jobs.get(job.id);
    if (!current) return;

    if (current.action === "pause") {
      current.status = "paused";
      current.action = "none";
      current.abort = undefined;
      emit();
      await persistJob(current);
      return;
    }

    if (current.action === "cancel" || (err instanceof Error && err.message === "Upload cancelled")) {
      removeJob(job.id);
      await deletePendingUpload(job.id);
      emit();
      return;
    }

    current.status = "error";
    current.error = err instanceof Error ? err.message : "Upload failed";
    current.abort = undefined;
    emit();
    notify.error(err, `Failed to upload ${job.name}`);
  } finally {
    pump();
  }
}

function pump() {
  if (activeCount() >= MAX_CONCURRENT) return;
  const next = jobOrder
    .map((id) => jobs.get(id))
    .find((job) => job?.status === "queued");
  if (!next) return;
  void startJob(next);
  if (activeCount() >= MAX_CONCURRENT) return;
  pump();
}

export async function enqueueUploads({
  date,
  category,
  title,
  files,
}: {
  date: string;
  category: string;
  title: string;
  files: File[];
}) {
  for (const file of files) {
    const id = crypto.randomUUID();
    const job: InternalJob = {
      id,
      file,
      name: file.name,
      size: file.size,
      date,
      category,
      title,
      percent: 0,
      status: "queued",
      action: "none",
      createdAt: Date.now(),
    };
    jobs.set(id, job);
    jobOrder.push(id);
    await persistJob(job);
  }
  emit();
  pump();
}

export function cancelUpload(id: string) {
  const job = jobs.get(id);
  if (!job) return;

  if (job.status === "uploading") {
    job.action = "cancel";
    job.abort?.abort();
    return;
  }

  removeJob(id);
  void deletePendingUpload(id);
  emit();
}

export function pauseUpload(id: string) {
  const job = jobs.get(id);
  if (!job) return;

  if (job.status === "uploading") {
    job.action = "pause";
    job.abort?.abort();
    return;
  }

  if (job.status === "queued") {
    job.status = "paused";
    emit();
    void persistJob(job);
  }
}

export function resumeUpload(id: string) {
  const job = jobs.get(id);
  if (!job) return;
  if (job.status !== "paused" && job.status !== "error") return;

  job.status = "queued";
  job.error = undefined;
  job.action = "none";
  job.percent = 0;
  emit();
  void persistJob(job);
  pump();
}

export async function restorePendingUploads() {
  if (restoring) return;
  restoring = true;
  try {
    const stored = await loadPendingUploads();
    for (const item of stored) {
      if (jobs.has(item.id)) continue;
      const file = new File([item.blob], item.name, {
        type: item.type,
        lastModified: item.lastModified,
      });
      jobs.set(item.id, {
        id: item.id,
        file,
        name: item.name,
        size: item.size,
        date: item.date,
        category: item.category,
        title: item.title,
        percent: item.percent ?? 0,
        status: item.status === "paused" ? "paused" : "queued",
        action: "none",
        createdAt: item.createdAt,
      });
      jobOrder.push(item.id);
    }
    emit();
    pump();
  } catch (err) {
    restoring = false;
    console.error("Failed to restore pending uploads", err);
  }
}
