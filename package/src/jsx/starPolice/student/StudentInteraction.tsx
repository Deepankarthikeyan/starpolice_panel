import { FormEvent, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import { notify } from "../toast";
import type { ChatMessage } from "../types";

type InteractionMode = "group" | "private";

const StudentInteraction = () => {
  const [mode, setMode] = useState<InteractionMode>("group");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    const data = await api.getMessages({ channel: mode });
    setMessages(data);
  };

  useEffect(() => {
    loadMessages().catch(console.error);
    const interval = window.setInterval(() => {
      loadMessages().catch(console.error);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [mode]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await api.sendMessage(message.trim(), { channel: mode });
      setMessage("");
      await loadMessages();
      notify.success(
        mode === "group" ? "Message posted to the group." : "Private message sent to admin."
      );
    } catch (error) {
      notify.error(error, "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Admin Interaction" pageContent="" />
      <div className="card">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="card-title mb-0">Admin Interaction</h4>
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
              Private
            </button>
          </div>
        </div>
        <div className="card-body">
          <p className="text-muted small mb-3">
            {mode === "group"
              ? "Group messages are visible to all students."
              : "Private messages are only between you and the admin."}
          </p>

          <div className="spa-interaction-feed mb-4">
            {messages.length === 0 ? (
              <p className="text-muted mb-0">
                {mode === "group"
                  ? "No group messages yet."
                  : "No private messages yet. Send a message to admin."}
              </p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`spa-interaction-bubble ${
                    item.senderRole === "student" ? "is-mine" : "is-other"
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
                placeholder={mode === "group" ? "Reply in group..." : "Private message to admin..."}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-start">
              <button type="submit" className="btn btn-primary w-100 spa-interaction-send" disabled={loading}>
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
