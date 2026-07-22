import { FormEvent, useEffect, useRef, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { api } from "../api";
import type { ChatMessage } from "../types";

interface InteractionChatProps {
  motherMenu: string;
  activeMenu: string;
  title: string;
  emptyText: string;
  placeholder: string;
}

const InteractionChat = ({
  motherMenu,
  activeMenu,
  title,
  emptyText,
  placeholder,
}: InteractionChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      <PageTitle motherMenu={motherMenu} activeMenu={activeMenu} pageContent="" />
      <div className="card spa-interaction-card">
        <div className="card-header">
          <h4 className="card-title mb-0">{title}</h4>
        </div>
        <div className="card-body spa-interaction-body">
          <div className="spa-interaction-messages">
            {messages.length === 0 ? (
              <p className="text-muted mb-0">{emptyText}</p>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`spa-interaction-bubble p-3 mb-3 rounded ${
                    item.senderRole === "admin" || item.senderRole === "superadmin"
                      ? "bg-primary-subtle ms-auto"
                      : "bg-light"
                  }`}
                >
                  <div className="fw-semibold">
                    {item.senderName} ({item.senderRole})
                  </div>
                  <div>{item.message}</div>
                  <small className="text-muted">{new Date(item.createdAt).toLocaleString()}</small>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={onSubmit} className="spa-interaction-form row g-3">
            <div className="col-md-10">
              <textarea
                className="form-control"
                rows={3}
                placeholder={placeholder}
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

export default InteractionChat;
