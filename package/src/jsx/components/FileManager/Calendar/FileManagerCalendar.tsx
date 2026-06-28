/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Component } from "react";
// @ts-ignore
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Swal from "sweetalert2";

interface CalendarEvent {
  title: string;
  start: Date;
  id: string;
}

interface FileManagerCalendarState {
  calendarEvents: CalendarEvent[];
}

class FileManagerCalendar extends Component<object, FileManagerCalendarState> {
  state: FileManagerCalendarState = {
    calendarEvents: [
      {
        title: "Atlanta Monster",
        start: new Date("2023-06-01"),
        id: "99991255",
      },
      {
        title: "Atlanta Monster",
        start: new Date("2023-06-04"),
        id: "99991297",
      },
      {
        title: "Birthday Party",
        start: new Date("2023-06-15"),
        id: "12912998",
      },
      {
        title: "Atlanta Monster",
        start: new Date("2023-06-25"),
        id: "99999997",
      },
      {
        title: "Birthday Party",
        start: new Date("2023-07-10"),
        id: "99999998",
      },
      {
        title: "My Favorite Murder",
        start: new Date("2023-07-19"),
        id: "99999999",
      },
      {
        title: "Atlanta Monster",
        start: new Date("2023-08-01"),
        id: "99991255",
      },
      {
        title: "Atlanta Monster",
        start: new Date("2023-08-04"),
        id: "99991297",
      },
      {
        title: "Birthday Party",
        start: new Date("2023-08-15"),
        id: "12912998",
      },
      {
        title: "Atlanta Monster",
        start: new Date("2023-08-25"),
        id: "99999997",
      },
      {
        title: "Birthday Party",
        start: new Date("2023-08-29"),
        id: "99999998",
      },
    ],
  };

  /**
   * Handles event click by showing details in a SweetAlert2 modal
   */
  eventClick = (eventClick: EventClickArg) => {
    Swal.fire({
      title: eventClick.event.title,
      html: `
        <div class="table-responsive">
          <table class="table">
            <tbody>
              <tr>
                <td>Title</td>
                <td><strong>${eventClick.event.title}</strong></td>
              </tr>
              <tr>
                <td>Start Time</td>
                <td><strong>${eventClick.event.start?.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Remove Event",
      cancelButtonText: "Close",
    }).then((result) => {
      if (result.isConfirmed) {
        eventClick.event.remove(); // Remove the event from the calendar
        Swal.fire("Deleted!", "Your event has been deleted.", "success");
      }
    });
  };

  render() {
    return (
      <div className="app-fullcalendar" id="calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          editable={true}
          droppable={true}
          events={this.state.calendarEvents}
          eventClick={this.eventClick}
        />
      </div>
    );
  }
}

export default FileManagerCalendar;
