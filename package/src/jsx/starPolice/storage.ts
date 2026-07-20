import type { ChatMessage, UploadedFile } from "./types";

const UPLOADS_KEY = "SPA_UPLOADS";
const MESSAGES_KEY = "SPA_MESSAGES";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUploads(): UploadedFile[] {
  return readJson<UploadedFile[]>(UPLOADS_KEY, []);
}

export function saveUpload(upload: UploadedFile) {
  const uploads = getUploads();
  uploads.unshift(upload);
  writeJson(UPLOADS_KEY, uploads);
}

export function deleteUpload(id: string) {
  writeJson(
    UPLOADS_KEY,
    getUploads().filter((item) => item.id !== id)
  );
}

export function getUploadsByDate(date: string) {
  return getUploads().filter((item) => item.date === date);
}

export function getMessages(): ChatMessage[] {
  return readJson<ChatMessage[]>(MESSAGES_KEY, []);
}

export function saveMessage(message: ChatMessage) {
  const messages = getMessages();
  messages.push(message);
  writeJson(MESSAGES_KEY, messages);
}

export function getCalendarUploadCounts() {
  const counts: Record<string, number> = {};
  getUploads().forEach((upload) => {
    counts[upload.date] = (counts[upload.date] ?? 0) + 1;
  });
  return counts;
}
