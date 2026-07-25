import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import { UploadPreviewButton } from "../shared/UploadFilePreview";
import type { FileCategory, UploadedFile } from "../types";

const categoryAccept: Record<FileCategory, string> = {
  video: "video/*",
  pdf: ".pdf,application/pdf",
  image: "image/*",
  document: ".doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,application/msword",
};

const DaywiseUpload = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FileCategory>("video");
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dateKey = useMemo(() => selectedDate.toISOString().slice(0, 10), [selectedDate]);

  const loadUploads = async () => {
    const data = await api.getUploads(dateKey);
    setUploads(data);
  };

  useEffect(() => {
    loadUploads().catch(console.error);
  }, [dateKey]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a title before uploading.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.uploadFiles(dateKey, category, trimmedTitle, Array.from(files));
      await loadUploads();
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle motherMenu="Admin Panel" activeMenu="Daywise Upload" pageContent="" />
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="col-xl-4">
          <div className="row g-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Select Date</h4>
                </div>
                <div className="card-body daywise-upload-calendar">
                  <label className="form-label fw-semibold mb-1">Upload Date</label>
                  <p className="text-muted small mb-3">
                    Click a date on the calendar — no typing needed.
                  </p>
                  <div className="daywise-upload-calendar-picker">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => date && setSelectedDate(date)}
                      inline
                      fixedHeight
                    />
                  </div>
                  <div className="alert alert-light py-2 mb-0 mt-3 text-center">
                    Selected: <strong>{dateKey}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Upload Files</h4>
                </div>
                <div className="card-body daywise-upload-form">
                  <label className="form-label fw-semibold mb-1" htmlFor="upload-title">
                    Title
                  </label>
                  <input
                    id="upload-title"
                    type="text"
                    className="form-control mb-3"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Morning Session Notes"
                    disabled={loading}
                  />

                  <label className="form-label fw-semibold mb-1" htmlFor="upload-type">
                    File Type
                  </label>
                  <select
                    id="upload-type"
                    className="form-select mb-3"
                    value={category}
                    onChange={(event) => setCategory(event.target.value as FileCategory)}
                    disabled={loading}
                  >
                    {Object.entries(FILE_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <div className="daywise-upload-dropzone">
                    <p className="text-muted small mb-3">
                      Upload videos, PDFs, images, and documents for the selected day.
                    </p>
                    <input
                      type="file"
                      className="form-control"
                      accept={categoryAccept[category]}
                      multiple
                      disabled={loading}
                      onChange={(event) => handleFiles(event.target.files)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">Uploads for {dateKey}</h4>
              <span className="badge bg-primary">{uploads.length} files</span>
            </div>
            <div className="card-body">
              {uploads.length === 0 ? (
                <p className="text-muted mb-0">No files uploaded for this date.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>File</th>
                        <th>Type</th>
                        <th>Uploaded At</th>
                        <th>Preview</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploads.map((upload) => (
                        <tr key={upload.id}>
                          <td className="fw-semibold">{upload.title || "—"}</td>
                          <td>{upload.name}</td>
                          <td>{FILE_CATEGORY_LABELS[upload.category]}</td>
                          <td>{new Date(upload.uploadedAt).toLocaleString()}</td>
                          <td>
                            <UploadPreviewButton upload={upload} />
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={async () => {
                                await api.deleteUpload(upload.id);
                                await loadUploads();
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DaywiseUpload;
