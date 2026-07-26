const API_BASE = import.meta.env.VITE_API_URL || "";

/** Resolve /uploads/... paths against the API host in production. */
export function getAbsoluteFileUrl(fileUrl: string) {
  if (fileUrl.startsWith("http")) {
    return fileUrl;
  }
  if (API_BASE) {
    return `${API_BASE}${fileUrl}`;
  }
  return `${window.location.origin}${fileUrl}`;
}
