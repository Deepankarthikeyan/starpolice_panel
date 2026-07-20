import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import PageTitle from "../../layouts/PageTitle";
import { deleteUpload, getUploads, saveUpload } from "../storage";
import { FILE_CATEGORY_LABELS } from "../constants";
import type { FileCategory, UploadedFile } from "../types";

const categoryAccept: Record<FileCategory, string> = {
  video: "video/*",
  pdf: ".pdf,application/pdf",
  image: "image/*",
  document: ".doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,application/msword",
};

const DaywiseUpload = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [category, setCategory] = useState<FileCategory>("video");
  const [refreshKey, setRefreshKey] = useState(0);

  const dateKey = useMemo(() => selectedDate.toISOString().slice(0, 10), [selectedDate]);
  const uploads = useMemo(() => {
    void refreshKey;
    return getUploads().filter((item) => item.date === dateKey);
  }, [dateKey, refreshKey]);

  const readFile = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      const dataUrl = await readFile(file);
      const upload: UploadedFile = {
        id: crypto.randomUUID(),
        date: dateKey,
        name: file.name,
        category,
        dataUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Academy Admin",
      };
      saveUpload(upload);
    }

    setRefreshKey((value) => value + 1);
  };

  return (
    <>
      <PageTitle motherMenu="Admin Panel" activeMenu="Daywise Upload" pageContent="" />
      <div className="row">
        <div className="col-xl-4">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Select Date</h4>
            </div>
            <div className="card-body">
              <label className="form-label fw-semibold">Upload Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                className="form-control mb-3"
                dateFormat="yyyy-MM-dd"
              />

              <label className="form-label fw-semibold">File Type</label>
              <select
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

              <div className="star-police-upload-box p-4 text-center">
                <p className="mb-3">Upload videos, PDFs, images, and documents for the selected day.</p>
                <input
                  type="file"
                  className="form-control"
                  accept={categoryAccept[category]}
                  multiple
                  onChange={(event) => handleFiles(event.target.files)}
                />
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
                        <th>Name</th>
                        <th>Type</th>
                        <th>Uploaded At</th>
                        <th>Preview</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploads.map((upload) => (
                        <tr key={upload.id}>
                          <td>{upload.name}</td>
                          <td>{FILE_CATEGORY_LABELS[upload.category]}</td>
                          <td>{new Date(upload.uploadedAt).toLocaleString()}</td>
                          <td>
                            {upload.category === "image" && (
                              <img src={upload.dataUrl} alt={upload.name} width={60} />
                            )}
                            {upload.category === "video" && (
                              <video src={upload.dataUrl} width={120} controls />
                            )}
                            {(upload.category === "pdf" || upload.category === "document") && (
                              <a href={upload.dataUrl} download={upload.name} className="btn btn-sm btn-outline-primary">
                                Download
                              </a>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                deleteUpload(upload.id);
                                setRefreshKey((value) => value + 1);
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
