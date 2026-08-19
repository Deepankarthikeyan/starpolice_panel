import { useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { notify } from "../toast";
import { getPanelMotherMenu } from "../panelLabels";
import {
  InteractionMessenger,
  type MessengerContact,
} from "../shared/InteractionMessenger";
import type { ChatMessage, ManagedUser } from "../types";

const GROUP_CONTACT_ID = "group";

const StudentInteraction = () => {
  const { auth } = useContext(ThemeContext);
  const [students, setStudents] = useState<ManagedUser[]>([]);
  const [activeContactId, setActiveContactId] = useState(GROUP_CONTACT_ID);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const contacts = useMemo<MessengerContact[]>(() => {
    const groupContact: MessengerContact = {
      id: GROUP_CONTACT_ID,
      kind: "group",
      title: "All Students",
      subtitle: "Group message to everyone",
      initials: "ALL",
    };

    const studentContacts = students.map((student) => ({
      id: student.id,
      kind: "private" as const,
      title: student.name,
      subtitle: student.email,
      initials: student.name.slice(0, 2).toUpperCase(),
    }));

    return [groupContact, ...studentContacts];
  }, [students]);

  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? contacts[0] ?? null;

  useEffect(() => {
    api
      .getUsers("student")
      .then((data) => setStudents(data.filter((student) => student.isActive)))
      .catch(console.error);
  }, []);

  const loadMessages = async () => {
    if (!activeContact) {
      setMessages([]);
      return;
    }

    const data = await api.getMessages(
      activeContact.kind === "group"
        ? { channel: "group" }
        : { channel: "private", studentUserId: activeContact.id }
    );
    setMessages(data);
  };

  useEffect(() => {
    loadMessages().catch(console.error);
    const interval = window.setInterval(() => {
      loadMessages().catch(console.error);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [activeContactId, activeContact?.kind, activeContact?.id]);

  const handleSend = async (text: string) => {
    if (!activeContact) return;

    setLoading(true);
    try {
      await api.sendMessage(text, {
        channel: activeContact.kind === "group" ? "group" : "private",
        studentUserId: activeContact.kind === "private" ? activeContact.id : undefined,
      });
      await loadMessages();
      notify.success(
        activeContact.kind === "group"
          ? "Group message sent to all students."
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
      <PageTitle motherMenu={getPanelMotherMenu(auth?.panel)} activeMenu="Student Interaction" pageContent="" />
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
            sidebarTitle="Student Chats"
            emptyThreadHint="Select Group or a student from the list."
          />
        </div>
      </div>
    </>
  );
};

export default StudentInteraction;
