import { FormEvent, useEffect, useRef, useState } from "react";
import type { ChatMessage, UserRole } from "../types";

export type MessengerContact = {
  id: string;
  kind: "group" | "private";
  title: string;
  subtitle?: string;
  initials: string;
};

type InteractionMessengerProps = {
  contacts: MessengerContact[];
  activeContactId: string;
  onSelectContact: (contactId: string) => void;
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
  loading?: boolean;
  viewerRole?: UserRole;
  sidebarTitle?: string;
  emptyThreadHint?: string;
};

function isAdminSide(role: UserRole) {
  return role === "admin" || role === "staff" || role === "superadmin";
}

function isMineMessage(item: ChatMessage, viewerRole?: UserRole) {
  if (!viewerRole) return false;
  if (item.senderRole === viewerRole) return true;
  return isAdminSide(item.senderRole) && isAdminSide(viewerRole);
}

export function InteractionMessenger({
  contacts,
  activeContactId,
  onSelectContact,
  messages,
  onSend,
  loading = false,
  viewerRole,
  sidebarTitle = "Chats",
  emptyThreadHint = "Select a chat to start messaging.",
}: InteractionMessengerProps) {
  const [draft, setDraft] = useState("");
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? contacts[0] ?? null;

  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages, activeContactId]);

  useEffect(() => {
    if (!activeContactId && contacts[0]) {
      onSelectContact(contacts[0].id);
    }
  }, [activeContactId, contacts, onSelectContact]);

  const handleSelect = (contactId: string) => {
    onSelectContact(contactId);
    setMobileThreadOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !activeContact) return;

    const text = draft.trim();
    setDraft("");
    await onSend(text);
  };

  return (
    <div className={`spa-messenger${mobileThreadOpen ? " is-thread-open" : ""}`}>
      <aside className="spa-messenger-sidebar">
        <div className="spa-messenger-sidebar-head">
          <h5 className="mb-0">{sidebarTitle}</h5>
        </div>
        <div className="spa-messenger-contact-list">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              className={`spa-messenger-contact${contact.id === activeContactId ? " is-active" : ""}`}
              onClick={() => handleSelect(contact.id)}
            >
              <div className={`spa-messenger-avatar${contact.kind === "group" ? " is-group" : ""}`}>
                {contact.initials}
              </div>
              <div className="spa-messenger-contact-copy">
                <div className="spa-messenger-contact-title">{contact.title}</div>
                {contact.subtitle && (
                  <div className="spa-messenger-contact-subtitle">{contact.subtitle}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="spa-messenger-thread">
        {!activeContact ? (
          <div className="spa-messenger-empty">{emptyThreadHint}</div>
        ) : (
          <>
            <div className="spa-messenger-thread-head">
              <button
                type="button"
                className="spa-messenger-back d-md-none"
                aria-label="Back to chats"
                onClick={() => setMobileThreadOpen(false)}
              >
                ←
              </button>
              <div className={`spa-messenger-avatar${activeContact.kind === "group" ? " is-group" : ""}`}>
                {activeContact.initials}
              </div>
              <div>
                <div className="spa-messenger-thread-title">{activeContact.title}</div>
                <div className="spa-messenger-thread-subtitle">
                  {activeContact.subtitle || (activeContact.kind === "group" ? "Group chat" : "Private chat")}
                </div>
              </div>
            </div>

            <div ref={feedRef} className="spa-messenger-feed">
              {messages.length === 0 ? (
                <p className="text-muted text-center mt-4 mb-0">
                  No messages yet. Type below to start the conversation.
                </p>
              ) : (
                messages.map((item) => {
                  const mine = isMineMessage(item, viewerRole);
                  return (
                    <div
                      key={item.id}
                      className={`spa-messenger-row ${mine ? "is-mine" : "is-other"}`}
                    >
                      {!mine && (
                        <div className="spa-messenger-msg-avatar">{item.senderName.slice(0, 2).toUpperCase()}</div>
                      )}
                      <div className={`spa-messenger-bubble ${mine ? "is-mine" : "is-other"}`}>
                        {!mine && <div className="spa-messenger-bubble-name">{item.senderName}</div>}
                        <div>{item.message}</div>
                        <small>{new Date(item.createdAt).toLocaleString()}</small>
                      </div>
                      {mine && (
                        <div className="spa-messenger-msg-avatar is-mine">{item.senderName.slice(0, 2).toUpperCase()}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <form className="spa-messenger-compose" onSubmit={handleSubmit}>
              <textarea
                className="form-control"
                rows={2}
                placeholder={
                  activeContact.kind === "group"
                    ? isAdminSide(viewerRole ?? "student")
                      ? "Message all students..."
                      : "Message the group..."
                    : isAdminSide(viewerRole ?? "student")
                      ? `Message ${activeContact.title}...`
                      : "Message admin..."
                }
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="submit" className="btn btn-primary spa-interaction-send" disabled={loading || !draft.trim()}>
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
