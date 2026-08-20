import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, UserRole } from "../types";

export type InteractionAudience = "group" | "student" | "staff" | "admin";

export type InteractionAudienceOption = {
  value: InteractionAudience;
  label: string;
};

export type MessengerContact = {
  id: string;
  kind: "group" | "private";
  contactType?: "student" | "staff" | "admin";
  title: string;
  subtitle?: string;
  initials: string;
  section?: string;
};

type InteractionMessengerProps = {
  contacts: MessengerContact[];
  activeContactId: string;
  onSelectContact: (contactId: string) => void;
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
  loading?: boolean;
  viewerRole?: UserRole;
  viewerId?: string;
  viewerEmail?: string;
  sidebarTitle?: string;
  emptyThreadHint?: string;
  audience?: InteractionAudience;
  audienceOptions?: InteractionAudienceOption[];
  onAudienceChange?: (audience: InteractionAudience) => void;
  hideContactList?: boolean;
};

function isAdminSide(role: UserRole) {
  return role === "admin" || role === "staff" || role === "superadmin";
}

function isMineMessage(item: ChatMessage, viewerId?: string, viewerEmail?: string) {
  if (viewerId && item.senderId) {
    return item.senderId === viewerId;
  }
  if (!viewerEmail || !item.senderEmail) return false;
  return item.senderEmail.toLowerCase() === viewerEmail.toLowerCase();
}

export function InteractionMessenger({
  contacts,
  activeContactId,
  onSelectContact,
  messages,
  onSend,
  loading = false,
  viewerRole,
  viewerId,
  viewerEmail,
  sidebarTitle = "Chats",
  emptyThreadHint = "Select a chat to start messaging.",
  audience,
  audienceOptions,
  onAudienceChange,
  hideContactList = false,
}: InteractionMessengerProps) {
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? contacts[0] ?? null;

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return contacts;

    const groupContact = contacts.find((contact) => contact.kind === "group");
    const privateContacts = contacts.filter((contact) => contact.kind !== "group");
    const matchedPrivate = privateContacts.filter((contact) => {
      const haystack = `${contact.title} ${contact.subtitle ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });

    return groupContact ? [groupContact, ...matchedPrivate] : matchedPrivate;
  }, [contacts, searchQuery]);

  useEffect(() => {
    if (!feedRef.current) return;
    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages, activeContactId]);

  useEffect(() => {
    if (hideContactList && contacts[0]) {
      setMobileThreadOpen(true);
    }
  }, [hideContactList, contacts]);

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
      <aside className={`spa-messenger-sidebar${hideContactList ? " is-group-only" : ""}`}>
        <div className="spa-messenger-sidebar-head">
          <h5 className="mb-0">{sidebarTitle}</h5>
        </div>
        {audienceOptions && audience && onAudienceChange && (
          <div className="spa-messenger-audience">
            <label className="form-label spa-messenger-audience-label" htmlFor="interaction-audience">
              Message to
            </label>
            <select
              id="interaction-audience"
              className="form-select"
              value={audience}
              onChange={(event) => onAudienceChange(event.target.value as InteractionAudience)}
            >
              {audienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {!hideContactList && (
        <div className="spa-messenger-search">
          <div className="spa-messenger-search-wrap">
            <i className="material-symbols-outlined spa-messenger-search-icon" aria-hidden="true">
              search
            </i>
            <input
              type="search"
              className="form-control"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search chats"
            />
            {searchQuery && (
              <button
                type="button"
                className="spa-messenger-search-clear"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>
        </div>
        )}
        {!hideContactList && (
        <div className="spa-messenger-contact-list">
          {filteredContacts.length === 0 ? (
            <p className="spa-messenger-search-empty">No chats match your search.</p>
          ) : (
            filteredContacts.map((contact, index) => {
              const previousSection = index > 0 ? filteredContacts[index - 1]?.section : undefined;
              const showSection = contact.section && contact.section !== previousSection;

              return (
                <div key={contact.id}>
                  {showSection && (
                    <div className="spa-messenger-section-label">{contact.section}</div>
                  )}
                  <button
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
                </div>
              );
            })
          )}
        </div>
        )}
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
                  const mine = isMineMessage(item, viewerId, viewerEmail);
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
                    : viewerRole === "student"
                      ? `Message ${activeContact.title}...`
                      : activeContact.contactType === "admin"
                        ? `Message ${activeContact.title}...`
                        : `Message ${activeContact.title}...`
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
