const DB_NAME = "spa-upload-queue";
const BLOB_STORE = "blobs";
const META_STORE = "meta";
const LEGACY_STORE = "jobs";
const DB_VERSION = 2;

export type PersistedUploadMeta = {
  id: string;
  name: string;
  type: string;
  lastModified: number;
  size: number;
  date: string;
  category: string;
  title: string;
  createdAt: number;
  status?: "queued" | "paused";
  percent?: number;
};

export type PersistedUploadJob = PersistedUploadMeta & {
  blob: Blob;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open upload database"));
  });
}

function txDone(tx: IDBTransaction, errorMessage: string) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error(errorMessage));
    tx.onabort = () => reject(tx.error ?? new Error(errorMessage));
  });
}

export async function savePendingUpload(job: PersistedUploadJob): Promise<void> {
  const db = await openDb();
  const tx = db.transaction([BLOB_STORE, META_STORE], "readwrite");
  tx.objectStore(BLOB_STORE).put({
    id: job.id,
    blob: job.blob,
    name: job.name,
    type: job.type,
    lastModified: job.lastModified,
    size: job.size,
  });
  tx.objectStore(META_STORE).put({
    id: job.id,
    name: job.name,
    type: job.type,
    lastModified: job.lastModified,
    size: job.size,
    date: job.date,
    category: job.category,
    title: job.title,
    createdAt: job.createdAt,
    status: job.status,
    percent: job.percent,
  });
  await txDone(tx, "Failed to save pending upload");
  db.close();
}

export async function upsertPendingMeta(meta: PersistedUploadMeta): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(META_STORE, "readwrite");
  tx.objectStore(META_STORE).put(meta);
  await txDone(tx, "Failed to update upload meta");
  db.close();
}

export async function deletePendingUpload(id: string): Promise<void> {
  const db = await openDb();
  const stores = [BLOB_STORE, META_STORE].filter((name) => db.objectStoreNames.contains(name));
  if (db.objectStoreNames.contains(LEGACY_STORE)) stores.push(LEGACY_STORE);
  const tx = db.transaction(stores, "readwrite");
  stores.forEach((name) => tx.objectStore(name).delete(id));
  await txDone(tx, "Failed to delete pending upload");
  db.close();
}

export async function loadPendingUploads(): Promise<PersistedUploadJob[]> {
  const db = await openDb();
  if (!db.objectStoreNames.contains(META_STORE) || !db.objectStoreNames.contains(BLOB_STORE)) {
    db.close();
    return [];
  }

  const metaItems = await new Promise<PersistedUploadMeta[]>((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const request = tx.objectStore(META_STORE).getAll();
    request.onsuccess = () => resolve((request.result as PersistedUploadMeta[]) ?? []);
    request.onerror = () => reject(request.error ?? new Error("Failed to load upload meta"));
  });

  const jobs: PersistedUploadJob[] = [];
  for (const meta of metaItems.sort((a, b) => a.createdAt - b.createdAt)) {
    const blobRecord = await new Promise<{ blob: Blob } | undefined>((resolve, reject) => {
      const tx = db.transaction(BLOB_STORE, "readonly");
      const request = tx.objectStore(BLOB_STORE).get(meta.id);
      request.onsuccess = () => resolve(request.result as { blob: Blob } | undefined);
      request.onerror = () => reject(request.error ?? new Error("Failed to load upload blob"));
    });
    if (!blobRecord?.blob) continue;
    jobs.push({ ...meta, blob: blobRecord.blob });
  }

  db.close();
  return jobs;
}
