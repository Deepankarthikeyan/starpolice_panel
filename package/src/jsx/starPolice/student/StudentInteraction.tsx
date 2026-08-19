import { useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { notify } from "../toast";
import {
  InteractionMessenger,
  type MessengerContact,
} from "../shared/InteractionMessenger";
import {
  GROUP_CONTACT_ID,
  buildGroupContact,
  messageParamsFromContact,
  messagingRecordToContact,
  sendParamsFromContact,
} from "../shared/interactionHelpers";
import type { ChatMessage, MessagingContact } from "../types";

const StudentInteraction = () => {
  const { auth } = useContext(ThemeContext);
  const [records, setRecords] = useState<MessagingContact[]>([]);
  const [activeContactId, setActiveContactId] = useState(GROUP_CONTACT_ID);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const contacts = useMemo<MessengerContact[]>(() => {
    const groupContact = buildGroupContact({
      title: "Group Announcements",
      subtitle: "Messages for all students",
      initials: "GRP",
    });

    return [groupContact, ...records.map(messagingRecordToContact)];
  }, [records]);

  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? contacts[0];

  useEffect(() => {
    api
      .getMessageContacts()
      .then(setRecords)
      .catch((error) => {
        notify.error(error, "Failed to load staff list");
      });
  }, []);

  const loadMessages = async () => {
    const data = await api.getMessages(messageParamsFromContact(activeContact));
    setMessages(data);
  };

  useEffect(() => {
    loadMessages().catch(console.error);
    const interval = window.setInterval(() => {
      loadMessages().catch(console.error);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [activeContactId, activeContact.id]);

  const handleSend = async (text: string) => {
    setLoading(true);
    try {
      await api.sendMessage(text, sendParamsFromContact(activeContact));
      await loadMessages();
      notify.success(
        activeContact.kind === "group"
          ? "Group message sent."
          : `Message sent to ${activeContact.title}.`
      );
    } catch (error) {
      notify.error(error, "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle motherMenu="Student Panel" activeMenu="Staff Interaction" pageContent="" />
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
            sidebarTitle="Staff Chats"
            emptyThreadHint="Select Group or a staff member from the list."
          />
        </div>
      </div>
    </>
  );
};

export default StudentInteraction;
