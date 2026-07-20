import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import type { UploadedFile } from "../types";

const StudentMaterials = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [uploads, setUploads] = useState<UploadedFile[]>([]);

  const dateKey = useMemo(() => selectedDate.toISOString().slice(0, 10), [selectedDate]);

  useEffect(() => {
    api.getUploads(dateKey).then(setUploads).catch(console.error);
  }, [dateKey]);

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Study Materials" pageContent="" />
      <div className="row">
        <div className="col-xl-4">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Choose Date</h4>
            </div>
            <div className="card-body">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                inline
              />
            </div>
          </div>
        </div>
        <div className="col-xl-8">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Materials for {dateKey}</h4>
            </div>
            <div className="card-body">
              {uploads.length === 0 ? (
                <p className="text-muted mb-0">No study materials available for this date.</p>
              ) : (
                uploads.map((upload) => (
                  <div key={upload.id} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="fw-semibold">{upload.name}</div>
                        <small className="text-muted">{FILE_CATEGORY_LABELS[upload.category]}</small>
                      </div>
                    </div>
                    {upload.category === "image" && (
                      <img src={upload.fileUrl} alt={upload.name} className="img-fluid rounded" />
                    )}
                    {upload.category === "video" && (
                      <video src={upload.fileUrl} controls className="w-100 rounded" />
                    )}
                    {(upload.category === "pdf" || upload.category === "document") && (
                      <a
                        href={upload.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        Download {upload.name}
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentMaterials;
