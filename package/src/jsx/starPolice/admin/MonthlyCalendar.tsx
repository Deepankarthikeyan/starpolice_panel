import { useContext, useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { FILE_CATEGORY_LABELS } from "../constants";
import { getAbsoluteFileUrl } from "../fileUrl";
import { getPanelMotherMenu } from "../panelLabels";
import type { UploadedFile } from "../types";

const MonthlyCalendar = () => {
  const { auth } = useContext(ThemeContext);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    api.getUploads().then(setUploads).catch(console.error);
  }, []);

  const events = useMemo(
    () =>
      uploads.map((upload) => ({
        id: upload.id,
        title: `${FILE_CATEGORY_LABELS[upload.category]}: ${upload.name}`,
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
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Monthly Calendar" pageContent="" />
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
                {selectedDate ? `Materials on ${selectedDate}` : "Select a date"}
              </h4>
            </div>
            <div className="card-body">
              {!selectedDate ? (
                <p className="text-muted mb-0">Click a date on the calendar to view uploaded materials.</p>
              ) : selectedUploads.length === 0 ? (
                <p className="text-muted mb-0">No uploads for this date.</p>
              ) : (
                selectedUploads.map((upload) => (
                  <div key={upload.id} className="border rounded p-3 mb-3">
                    <div className="fw-semibold">{upload.name}</div>
                    <small className="text-muted d-block mb-2">
                      {FILE_CATEGORY_LABELS[upload.category]}
                    </small>
                    {upload.category === "image" && (
                      <img src={getAbsoluteFileUrl(upload.fileUrl)} alt={upload.name} className="img-fluid rounded" />
                    )}
                    {upload.category === "video" && (
                      <video src={getAbsoluteFileUrl(upload.fileUrl)} controls className="w-100 rounded" />
                    )}
                    {(upload.category === "pdf" || upload.category === "document") && (
                      <a
                        href={getAbsoluteFileUrl(upload.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
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

export default MonthlyCalendar;
