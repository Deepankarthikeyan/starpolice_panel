import { api } from "../api";
import { notify } from "../toast";
import {
  deletePendingUpload,
  loadPendingUploads,
  savePendingUpload,
  upsertPendingMeta,
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
  lastEmitMs: number;
};

const MAX_CONCURRENT = 3;
const PROGRESS_EMIT_MS = 50;
const listeners = new Set<() => void>();
const jobs = new Map<string, InternalJob>();
const jobOrder: string[] = [];
const droppedIds = new Set<string>();
let snapshot: UploadJob[] = [];
let visibleSnapshot: UploadJob[] = [];
let restoring = false;
let emitFrame = 0;

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

function emitNow() {
  if (emitFrame) {
    cancelAnimationFrame(emitFrame);
    emitFrame = 0;
  }
  snapshot = jobOrder
    .map((id) => jobs.get(id))
    .filter((job): job is InternalJob => Boolean(job))
    .map(toPublicJob);
  visibleSnapshot = snapshot;
  listeners.forEach((listener) => listener());
}

function emitSoon() {
  if (emitFrame) return;
  emitFrame = requestAnimationFrame(() => {
    emitFrame = 0;
    emitNow();
  });
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

function persistBlob(job: InternalJob) {
  void savePendingUpload({
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
  }).then(() => {
    const current = jobs.get(job.id);
    if (droppedIds.has(job.id) || !current || current.status === "success") {
      void deletePendingUpload(job.id);
    }
  });
}

function persistMeta(job: InternalJob) {
  void upsertPendingMeta({
    id: job.id,
    name: job.name,
    type: job.file.type,
    lastModified: job.file.lastModified,
    size: job.size,
    date: job.date,
    category: job.category,
    title: job.title,
    createdAt: job.createdAt,
    status: job.status === "paused" ? "paused" : "queued",
    percent: job.percent,
  });
}

async function startJob(job: InternalJob) {
  if (job.status !== "queued") return;

  job.status = "uploading";
  job.action = "none";
  job.percent = Math.max(job.percent, 1);
  job.abort = new AbortController();
  emitNow();

  try {
    await api.uploadFile(job.date, job.category, job.title, job.file, {
      onProgress: (percent) => {
        const current = jobs.get(job.id);
        if (!current || current.status !== "uploading") return;
        current.percent = percent;
        const now = performance.now();
        if (percent >= 100 || now - current.lastEmitMs >= PROGRESS_EMIT_MS) {
          current.lastEmitMs = now;
          emitSoon();
        }
      },
      signal: job.abort.signal,
    });

    const current = jobs.get(job.id);
    if (!current) return;
    current.status = "success";
    current.percent = 100;
    current.abort = undefined;
    droppedIds.add(job.id);
    emitNow();
    void deletePendingUpload(job.id);
    window.dispatchEvent(
      new CustomEvent(SPA_UPLOAD_COMPLETE_EVENT, { detail: { date: job.date } })
    );
    notify.success(`${job.name} uploaded successfully.`);
    window.setTimeout(() => {
      if (jobs.get(job.id)?.status === "success") {
        removeJob(job.id);
        emitNow();
      }
    }, 800);
  } catch (err) {
    const current = jobs.get(job.id);
    if (!current) return;

    if (current.action === "pause" || current.status === "paused") {
      current.status = "paused";
      current.action = "none";
      current.abort = undefined;
      emitNow();
      persistMeta(current);
      return;
    }

    if (current.action === "cancel" || (err instanceof Error && err.message === "Upload cancelled")) {
      return;
    }

    current.status = "error";
    current.error = err instanceof Error ? err.message : "Upload failed";
    current.abort = undefined;
    emitNow();
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

export function enqueueUploads({
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
      lastEmitMs: 0,
    };
    jobs.set(id, job);
    jobOrder.push(id);
    persistBlob(job);
  }
  emitNow();
  pump();
}

export function cancelUpload(id: string) {
  const job = jobs.get(id);
  if (!job) return;

  job.action = "cancel";
  droppedIds.add(id);
  const xhrAbort = job.abort;
  job.abort = undefined;
  removeJob(id);
  emitNow();
  xhrAbort?.abort();
  void deletePendingUpload(id);
}

export function pauseUpload(id: string) {
  const job = jobs.get(id);
  if (!job) return;
  if (job.status !== "uploading" && job.status !== "queued") return;

  job.action = "pause";
  job.status = "paused";
  const xhrAbort = job.abort;
  job.abort = undefined;
  emitNow();
  xhrAbort?.abort();
  persistMeta(job);
}

export function resumeUpload(id: string) {
  const job = jobs.get(id);
  if (!job) return;
  if (job.status !== "paused" && job.status !== "error") return;

  job.status = "queued";
  job.error = undefined;
  job.action = "none";
  job.percent = 0;
  emitNow();
  persistMeta(job);
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
        lastEmitMs: 0,
      });
      jobOrder.push(item.id);
    }
    emitNow();
    pump();
  } catch (err) {
    restoring = false;
    console.error("Failed to restore pending uploads", err);
  }
}
