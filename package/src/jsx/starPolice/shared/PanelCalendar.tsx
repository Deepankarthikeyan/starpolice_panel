import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarOptions } from "@fullcalendar/core";

const DEFAULT_TOOLBAR = {
  left: "prev,next today",
  center: "title",
  right: "",
};

const PanelCalendar = ({ plugins, headerToolbar, ...props }: CalendarOptions) => {
  const calendarRef = useRef<FullCalendar>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => calendarRef.current?.getApi().updateSize();
    const frame = window.requestAnimationFrame(update);
    const later = window.setTimeout(update, 250);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    const observer = wrapRef.current ? new ResizeObserver(update) : null;
    if (wrapRef.current) observer?.observe(wrapRef.current);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(later);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      observer?.disconnect();
    };
  }, []);

  return (
    <div className="spa-calendar-wrap" ref={wrapRef}>
      <FullCalendar
        ref={calendarRef}
        initialView="dayGridMonth"
        dayMaxEvents={2}
        moreLinkClick="popover"
        eventDisplay="block"
        {...props}
        plugins={plugins ?? [dayGridPlugin, interactionPlugin]}
        headerToolbar={headerToolbar ?? DEFAULT_TOOLBAR}
        height="auto"
        contentHeight="auto"
        expandRows
        handleWindowResize
        stickyHeaderDates={false}
      />
    </div>
  );
};

export default PanelCalendar;
