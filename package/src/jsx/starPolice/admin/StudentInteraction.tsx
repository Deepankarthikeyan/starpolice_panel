import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { notify } from "../toast";
import { getPanelMotherMenu } from "../panelLabels";
import type { ChatMessage, ManagedUser } from "../types";

type InteractionMode = "group" | "private";

const StudentInteraction = () => {
  const { auth } = useContext(ThemeContext);
  const [mode, setMode] = useState<InteractionMode>("group");
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [students, selectedStudentId]
  );

  useEffect(() => {
    api
      .getUsers("student")
      .then((data) => {
        const activeStudents = data.filter((student) => student.isActive);
        setStudents(activeStudents);
        if (activeStudents.length > 0) {
          setSelectedStudentId((current) => current || activeStudents[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const loadMessages = async () => {
    if (mode === "private" && !selectedStudentId) {
      setMessages([]);
      return;
    }

    const data = await api.getMessages(
      mode === "group"
        ? { channel: "group" }
        : { channel: "private", studentUserId: selectedStudentId }
    );
    setMessages(data);
  };

  useEffect(() => {
    loadMessages().catch(console.error);
    const interval = window.setInterval(() => {
      loadMessages().catch(console.error);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [mode, selectedStudentId]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    if (mode === "private" && !selectedStudentId) {
      notify.error("Select a student before sending a private message.");
      return;
    }

    setLoading(true);
    try {
      await api.sendMessage(message.trim(), {
        channel: mode,
        studentUserId: mode === "private" ? selectedStudentId : undefined,
      });
      setMessage("");
      await loadMessages();
      notify.success(
        mode === "group"
          ? "Group message sent to all students."
          : `Private message sent to ${selectedStudent?.name || "student"}.`
      );
    } catch (error) {
      notify.error(error, "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Student Interaction" pageContent="" />
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="card-title mb-0">Student Interaction</h4>
          <div className="btn-group spa-interaction-mode" role="group" aria-label="Message mode">
            <button
              type="button"
              className={`btn btn-sm ${mode === "group" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setMode("group")}
            >
              Group
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === "private" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setMode("private")}
            >
              Individual
            </button>
          </div>
        </div>
        <div className="card-body">
          {mode === "group" ? (
            <p className="text-muted small mb-3">
              Send a message to all students. Everyone in the student panel can see it.
            </p>
          ) : (
            <div className="mb-3">
              <label className="form-label fw-semibold" htmlFor="interaction-student">
                Select student
              </label>
              <select
                id="interaction-student"
                className="form-select"
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
              >
                {students.length === 0 ? (
                  <option value="">No active students found</option>
                ) : (
                  students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))
                )}
              </select>
              <p className="text-muted small mt-2 mb-0">
                Only the selected student will see messages sent here.
              </p>
            </div>
          )}

          <div className="spa-interaction-feed mb-4">
            {messages.length === 0 ? (
              <p className="text-muted mb-0">
                {mode === "group"
                  ? "No group messages yet. Send an announcement to all students."
                  : selectedStudent
                    ? `No private messages with ${selectedStudent.name} yet.`
                    : "Select a student to start a private conversation."}
              </p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`spa-interaction-bubble ${
                    ["admin", "staff", "superadmin"].includes(item.senderRole) ? "is-mine" : "is-other"
                  }`}
                >
                  <div className="spa-interaction-bubble-head">
                    <span className="fw-semibold">
                      {item.senderName} ({item.senderRole})
                    </span>
                    {item.channel === "private" && <span className="badge bg-secondary">Private</span>}
                  </div>
                  <div>{item.message}</div>
                  <small className="text-muted">{new Date(item.createdAt).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>

          <form onSubmit={onSubmit} className="row g-3">
            <div className="col-md-10">
              <textarea
                className="form-control"
                rows={3}
                placeholder={
                  mode === "group"
                    ? "Message all students..."
                    : selectedStudent
                      ? `Private message to ${selectedStudent.name}...`
                      : "Select a student first..."
                }
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={mode === "private" && !selectedStudentId}
              />
            </div>
            <div className="col-md-2 d-flex align-items-start">
              <button
                type="submit"
                className="btn btn-primary w-100 spa-interaction-send"
                disabled={loading || (mode === "private" && !selectedStudentId)}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default StudentInteraction;
