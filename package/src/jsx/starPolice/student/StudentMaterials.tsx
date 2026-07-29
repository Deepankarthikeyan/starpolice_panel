import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import { UploadPreviewButton } from "../shared/UploadFilePreview";
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
              <h4 className="card-title mb-0">Select Date</h4>
            </div>
            <div className="card-body daywise-upload-calendar">
              <label className="form-label fw-semibold mb-3">Study Date</label>
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
                        <div className="fw-semibold">{upload.title || upload.name}</div>
                        {upload.title && (
                          <small className="text-muted d-block">{upload.name}</small>
                        )}
                        <small className="text-muted">{FILE_CATEGORY_LABELS[upload.category]}</small>
                      </div>
                      <UploadPreviewButton upload={upload} />
                    </div>
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
