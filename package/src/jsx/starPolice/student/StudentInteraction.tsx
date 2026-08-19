import { useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { notify } from "../toast";
import {
  InteractionMessenger,
  type MessengerContact,
} from "../shared/InteractionMessenger";
import type { ChatMessage } from "../types";

const GROUP_CONTACT_ID = "group";
const ADMIN_CONTACT_ID = "admin-private";

const StudentInteraction = () => {
  const { auth } = useContext(ThemeContext);
  const [activeContactId, setActiveContactId] = useState(GROUP_CONTACT_ID);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const contacts = useMemo<MessengerContact[]>(
    () => [
      {
        id: GROUP_CONTACT_ID,
        kind: "group",
        title: "Group Announcements",
        subtitle: "Messages for all students",
        initials: "GRP",
      },
      {
        id: ADMIN_CONTACT_ID,
        kind: "private",
        title: "Admin",
        subtitle: "Private chat with admin",
        initials: "AD",
      },
    ],
    []
  );

  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? contacts[0];

  const loadMessages = async () => {
    const data = await api.getMessages({
      channel: activeContact.id === GROUP_CONTACT_ID ? "group" : "private",
    });
    setMessages(data);
  };

  useEffect(() => {
    loadMessages().catch(console.error);
    const interval = window.setInterval(() => {
      loadMessages().catch(console.error);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [activeContactId]);

  const handleSend = async (text: string) => {
    setLoading(true);
    try {
      await api.sendMessage(text, {
        channel: activeContact.id === GROUP_CONTACT_ID ? "group" : "private",
      });
      await loadMessages();
      notify.success("Message sent.");
    } catch (error) {
      notify.error(error, "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Admin Interaction" pageContent="" />
      <div className="card spa-messenger-card">
        <div className="card-body p-0">
          <InteractionMessenger
            contacts={contacts}
            activeContactId={activeContactId}
            onSelectContact={setActiveContactId}
            messages={messages}
            onSend={handleSend}
            loading={loading}
            viewerRole={auth?.role}
            sidebarTitle="Admin Chats"
            emptyThreadHint="Select Group or Admin from the list."
          />
        </div>
      </div>
    </>
  );
};

export default StudentInteraction;
