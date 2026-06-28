/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect, useRef } from "react";
import { Col, Row, Card } from "react-bootstrap";
// @ts-expect-error
import FullCalendar, { EventClickArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import Alert from "sweetalert2";

// Define types for the events and calendar events
interface CalendarEvent {
  title: string;
  start: Date;
  id: string;
}

interface Event {
  title: string;
  id: string;
}

const EventCalendar: React.FC = () => {
  const [calendarEvents] = useState<CalendarEvent[]>([
    {
      title: "Atlanta Monster",
      start: new Date("2023-06-01 00:00"),
      id: "99991255",
    },
    {
      title: "Atlanta Monster",
      start: new Date("2023-06-04 00:00"),
      id: "99991297",
    },
    {
      title: "Birthday Party",
      start: new Date("2023-06-15 00:00"),
      id: "12912998",
    },
    {
      title: "Atlanta Monster",
      start: new Date("2023-06-25 00:00"),
      id: "99999997",
    },
    {
      title: "Birthday Party",
      start: new Date("2023-07-10 00:00"),
      id: "99999998",
    },
    {
      title: "My Favorite Murder",
      start: new Date("2023-07-19 00:00"),
      id: "99999999",
    },
    {
      title: "Atlanta Monster",
      start: new Date("2023-08-01 00:00"),
      id: "99991255",
    },
    {
      title: "Atlanta Monster",
      start: new Date("2023-08-04 00:00"),
      id: "99991297",
    },
    {
      title: "Birthday Party",
      start: new Date("2023-08-15 00:00"),
      id: "12912998",
    },
    {
      title: "Atlanta Monster",
      start: new Date("2023-08-25 00:00"),
      id: "99999997",
    },
    {
      title: "Birthday Party",
      start: new Date("2023-08-29 00:00"),
      id: "99999998",
    },
  ]);

  const [events] = useState<Event[]>([
    { title: "Event 1", id: "1" },
    { title: "Event 2", id: "2" },
    { title: "Event 3", id: "3" },
    { title: "Event 4", id: "4" },
    { title: "Event 5", id: "5" },
  ]);

  const calendarComponentRef = useRef<FullCalendar | null>(null);

  // Adding draggable functionality to external events
  useEffect(() => {
    const draggableEl = document.getElementById("external-events");
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: ".fc-event",
        eventData: (eventEl: HTMLElement) => {
          const title = eventEl.getAttribute("title");
          const id = eventEl.getAttribute("data");
          return {
            title,
            id,
          };
        },
      });
    }
  }, []);

  // Event click handler
  const eventClick = (eventClick: EventClickArg) => {
    Alert.fire({
      title: eventClick.event.title,
      html: `<div className="table-responsive">
        <table className="table">
          <tbody>
            <tr>
              <td>Title</td>
              <td><strong>${eventClick.event.title}</strong></td>
            </tr>
            <tr>
              <td>Start Time</td>
              <td><strong>${eventClick.event.start}</strong></td>
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
      if (result.value) {
        eventClick.event.remove(); // Remove the event from the calendar
        Alert.fire("Deleted!", "Your Event has been deleted.", "success");
      }
    });
  };

  return (
    <div className="animated fadeIn demo-app">
      <Row>
        <Col lg={3}>
          <Card>
            <div className="card-header border-0 pb-0">
              <h4 className="fs-20 mb-0">Events</h4>
            </div>
            <Card.Body>
              <div id="external-events">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="fc-event mt-0 ms-0 mb-2 btn btn-block btn-primary"
                    title={event.title}
                    //   data={event.id}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <Card>
            <Card.Body>
              <div className="demo-app-calendar" id="mycalendartest">
                <FullCalendar
                  headerToolbar={{
                    start: "prev,next today",
                    center: "title",
                    end: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  rerenderDelay={10}
                  eventDurationEditable={false}
                  editable={true}
                  droppable={true}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  ref={calendarComponentRef}
                  events={calendarEvents}
                  eventClick={eventClick}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EventCalendar;
