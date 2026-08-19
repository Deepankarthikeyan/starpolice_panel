import { useContext, useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import { getPanelMotherMenu } from "../panelLabels";
import { notify } from "../toast";
import { UploadTaskList, useUploadJobs } from "../shared/UploadTaskList";
import { UploadPreviewButton } from "../shared/UploadFilePreview";
import { enqueueUploads, SPA_UPLOAD_COMPLETE_EVENT } from "../uploads/uploadQueueStore";
import type { FileCategory, UploadedFile } from "../types";

const categoryAccept: Record<FileCategory, string> = {
  video: "video/*",
  pdf: ".pdf,application/pdf",
  image: "image/*",
  document: ".doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,application/msword",
};

const DaywiseUpload = () => {
  const { auth } = useContext(ThemeContext);
  const uploadJobs = useUploadJobs();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FileCategory>("video");
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | FileCategory>("all");
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const dateKey = useMemo(() => selectedDate.toISOString().slice(0, 10), [selectedDate]);

  const filteredUploads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return uploads.filter((upload) => {
      if (typeFilter !== "all" && upload.category !== typeFilter) {
        return false;
      }

      if (!query) return true;

      const typeLabel = FILE_CATEGORY_LABELS[upload.category].toLowerCase();
      return (
        upload.title?.toLowerCase().includes(query) ||
        upload.name.toLowerCase().includes(query) ||
        upload.category.toLowerCase().includes(query) ||
        typeLabel.includes(query)
      );
    });
  }, [uploads, searchQuery, typeFilter]);

  const hasActiveFilters = searchQuery.trim().length > 0 || typeFilter !== "all";

  useEffect(() => {
    setSearchQuery("");
    setTypeFilter("all");
  }, [dateKey]);

  useEffect(() => {
    if (!error) return;

    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [error]);

  const loadUploads = async () => {
    const data = await api.getUploads(dateKey);
    setUploads(data);
  };

  useEffect(() => {
    loadUploads().catch(console.error);
  }, [dateKey]);

  useEffect(() => {
    function onComplete(event: Event) {
      const date = (event as CustomEvent<{ date?: string }>).detail?.date;
      if (!date || date === dateKey) {
        loadUploads().catch(console.error);
      }
    }

    window.addEventListener(SPA_UPLOAD_COMPLETE_EVENT, onComplete);
    return () => window.removeEventListener(SPA_UPLOAD_COMPLETE_EVENT, onComplete);
  }, [dateKey]);

  const handleFiles = async (files: FileList | null, input?: HTMLInputElement | null) => {
    if (!files?.length) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError(true);
      const message = "Please enter a title before uploading.";
      setError(message);
      notify.error(message);
      titleInputRef.current?.focus();
      if (input) input.value = "";
      return;
    }

    setError("");
    setTitleError(false);

    try {
      await enqueueUploads({
        date: dateKey,
        category,
        title: trimmedTitle,
        files: Array.from(files),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      notify.error(err, "Upload failed");
    }
  };

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Daywise Upload" pageContent="" />
      {error && (
        <div ref={errorRef} className="alert alert-danger">
          {error}
        </div>
      )}
      <div className="row">
        <div className="col-xl-4">
          <div className="row g-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title mb-0">Select Date</h4>
                </div>
                <div className="card-body daywise-upload-calendar">
                  <label className="form-label fw-semibold mb-3">Upload Date</label>
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
                    ref={titleInputRef}
                    id="upload-title"
                    type="text"
                    className={`form-control mb-3${titleError ? " is-invalid" : ""}`}
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (titleError) {
                        setTitleError(false);
                        setError("");
                      }
                    }}
                    placeholder="e.g. Morning Session Notes"
                  />
                  {titleError && (
                    <div className="invalid-feedback d-block mb-3">Title is required.</div>
                  )}

                  <label className="form-label fw-semibold mb-1" htmlFor="upload-type">
                    File Type
                  </label>
                  <select
                    id="upload-type"
                    className="form-select mb-3"
                    value={category}
                    onChange={(event) => setCategory(event.target.value as FileCategory)}
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
                      onChange={(event) => {
                        void handleFiles(event.target.files, event.target);
                        event.target.value = "";
                      }}
                    />
                    {uploadJobs.length > 0 && (
                      <div className="mt-3">
                        <UploadTaskList jobs={uploadJobs} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h4 className="card-title mb-0">Uploads for {dateKey}</h4>
              <span className="badge bg-primary">
                {hasActiveFilters
                  ? `${filteredUploads.length} of ${uploads.length} files`
                  : `${uploads.length} files`}
              </span>
            </div>
            <div className="card-body">
              {uploads.length > 0 && (
                <div className="row g-2 align-items-center mb-3 daywise-upload-filters">
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by title, file name, or type..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-auto">
                    <select
                      className="form-select daywise-upload-type-filter"
                      value={typeFilter}
                      onChange={(event) =>
                        setTypeFilter(event.target.value as "all" | FileCategory)
                      }
                    >
                      <option value="all">All File Types</option>
                      {Object.entries(FILE_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {hasActiveFilters && (
                    <div className="col-12 col-sm-auto">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setSearchQuery("");
                          setTypeFilter("all");
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}
              {uploads.length === 0 ? (
                <p className="text-muted mb-0">No files uploaded for this date.</p>
              ) : filteredUploads.length === 0 ? (
                <p className="text-muted mb-0">No uploads match your search or filter.</p>
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
                      {filteredUploads.map((upload) => (
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
                                try {
                                  await api.deleteUpload(upload.id);
                                  await loadUploads();
                                  notify.success("Upload deleted successfully.");
                                } catch (err) {
                                  notify.error(err, "Failed to delete upload");
                                }
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
