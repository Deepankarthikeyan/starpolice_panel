import { FormEvent, useContext, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { getMessages, saveMessage } from "../storage";
import type { ChatMessage } from "../types";

const StudentInteraction = () => {
  const { auth } = useContext(ThemeContext);
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const messages = useMemo(() => {
    void refreshKey;
    return getMessages();
  }, [refreshKey]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !auth) return;

    const entry: ChatMessage = {
      id: crypto.randomUUID(),
      senderRole: "student",
      senderName: auth.name,
      senderEmail: auth.email,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    saveMessage(entry);
    setMessage("");
    setRefreshKey((value) => value + 1);
  };

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Admin Interaction" pageContent="" />
      <div className="card">
        <div className="card-header">
          <h4 className="card-title mb-0">Chat with Admin</h4>
        </div>
        <div className="card-body">
          <div style={{ minHeight: 360, maxHeight: 480, overflowY: "auto" }} className="mb-4">
            {messages.length === 0 ? (
              <p className="text-muted">No messages yet. Ask your admin a question.</p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 mb-3 rounded ${
                    item.senderRole === "admin" ? "bg-primary-subtle ms-auto" : "bg-light"
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
                placeholder="Message admin..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-start">
              <button type="submit" className="btn btn-primary w-100">
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
