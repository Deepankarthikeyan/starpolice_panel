import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import PageTitle from "../../layouts/PageTitle";
import { getUploads } from "../storage";
import { FILE_CATEGORY_LABELS } from "../constants";

const StudentCalendar = () => {
  const uploads = getUploads();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const events = useMemo(
    () =>
      uploads.map((upload) => ({
        id: upload.id,
        title: upload.name,
        start: upload.date,
        allDay: true,
      })),
    [uploads]
  );

  const selectedUploads = selectedDate
    ? uploads.filter((upload) => upload.date === selectedDate)
    : [];

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Monthly Calendar" pageContent="" />
      <div className="row">
        <div className="col-xl-8">
          <div className="card">
            <div className="card-body">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="auto"
                events={events}
                dateClick={(info) => setSelectedDate(info.dateStr)}
                eventClick={(info: EventClickArg) => setSelectedDate(info.event.startStr.slice(0, 10))}
              />
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">
                {selectedDate ? `Study plan for ${selectedDate}` : "Select a date"}
              </h4>
            </div>
            <div className="card-body">
              {!selectedDate ? (
                <p className="text-muted mb-0">Click a highlighted date to view study materials.</p>
              ) : selectedUploads.length === 0 ? (
                <p className="text-muted mb-0">No materials for this date.</p>
              ) : (
                selectedUploads.map((upload) => (
                  <div key={upload.id} className="border rounded p-3 mb-3">
                    <div className="fw-semibold">{upload.name}</div>
                    <small className="text-muted d-block mb-2">
                      {FILE_CATEGORY_LABELS[upload.category]}
                    </small>
                    {(upload.category === "pdf" || upload.category === "document") && (
                      <a href={upload.dataUrl} download={upload.name} className="btn btn-sm btn-outline-primary">
                        Download
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

export default StudentCalendar;
