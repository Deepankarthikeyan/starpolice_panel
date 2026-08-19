const DB_NAME = "spa-upload-queue";
const STORE_NAME = "jobs";
const DB_VERSION = 1;

export type PersistedUploadJob = {
  id: string;
  name: string;
  type: string;
  lastModified: number;
  size: number;
  date: string;
  category: string;
  title: string;
  blob: Blob;
  createdAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open upload database"));
  });
}

export async function savePendingUpload(job: PersistedUploadJob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(job);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save pending upload"));
  });
  db.close();
}

export async function deletePendingUpload(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to delete pending upload"));
  });
  db.close();
}

export async function loadPendingUploads(): Promise<PersistedUploadJob[]> {
  const db = await openDb();
  const jobs = await new Promise<PersistedUploadJob[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result as PersistedUploadJob[]) ?? []);
    request.onerror = () => reject(request.error ?? new Error("Failed to load pending uploads"));
  });
  db.close();
  return jobs.sort((a, b) => a.createdAt - b.createdAt);
}
