import { FormEvent, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import type { ChatMessage } from "../types";

const StudentInteraction = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    const data = await api.getMessages();
    setMessages(data);
  };

  useEffect(() => {
    loadMessages().catch(console.error);
    const interval = setInterval(() => {
      loadMessages().catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await api.sendMessage(message.trim());
      setMessage("");
      await loadMessages();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle motherMenu="Admin Panel" activeMenu="Student Interaction" pageContent="" />
      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">Admin & Student Interaction</h4>
        </div>
        <div className="card-body">
          <div style={{ minHeight: 360, maxHeight: 480, overflowY: "auto" }} className="mb-4">
            {messages.length === 0 ? (
              <p className="text-muted">No messages yet. Start the conversation with your students.</p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 mb-3 rounded ${
                    item.senderRole === "admin" || item.senderRole === "superadmin"
                      ? "bg-primary-subtle ms-auto"
                      : "bg-light"
                  }`}
                  style={{ maxWidth: "75%" }}
                >
                  <div className="fw-semibold">
                    {item.senderName} ({item.senderRole})
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
                placeholder="Reply to students..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-start">
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
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
