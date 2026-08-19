import { useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { notify } from "../toast";
import { getPanelMotherMenu } from "../panelLabels";
import {
  InteractionMessenger,
  type InteractionAudienceOption,
  type MessengerContact,
} from "./InteractionMessenger";
import {
  GROUP_CONTACT_ID,
  buildGroupContact,
  messageParamsFromContact,
  messagingRecordToContact,
  sendParamsFromContact,
} from "./interactionHelpers";
import type { ChatMessage, MessagingContact } from "../types";

export type InteractionAudience = "group" | "student" | "staff" | "admin";

const GROUP_CONTACT = buildGroupContact({
  title: "Group Message",
  subtitle: "Send to all students",
  initials: "ALL",
});

function audienceScope(audience: InteractionAudience): "student" | "staff" | "admin" | undefined {
  if (audience === "group") return undefined;
  return audience;
}

export function useAdminInteractionPage() {
  const { auth } = useContext(ThemeContext);
  const isSuperAdmin = auth?.role === "superadmin";
  const [audience, setAudience] = useState<InteractionAudience>("group");
  const [records, setRecords] = useState<MessagingContact[]>([]);
  const [activeContactId, setActiveContactId] = useState(GROUP_CONTACT_ID);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const audienceOptions = useMemo<InteractionAudienceOption[]>(() => {
    const options: InteractionAudienceOption[] = [
      { value: "group", label: "Group" },
      { value: "student", label: "Student" },
    ];
    if (isSuperAdmin) {
      options.push({ value: "staff", label: "Staff" }, { value: "admin", label: "Admin" });
    }
    return options;
  }, [isSuperAdmin]);

  const contacts = useMemo<MessengerContact[]>(() => {
    if (audience === "group") {
      return [GROUP_CONTACT];
    }
    return records.map(messagingRecordToContact);
  }, [audience, records]);

  const activeContact =
    contacts.find((contact) => contact.id === activeContactId) ?? contacts[0] ?? null;

  useEffect(() => {
    if (audience === "group") {
      setRecords([]);
      setActiveContactId(GROUP_CONTACT_ID);
      return;
    }

    const scope = audienceScope(audience);
    api
      .getMessageContacts(scope)
      .then((data) => {
        setRecords(data);
        const first = data[0];
        if (first) {
          const mapped = messagingRecordToContact(first);
          setActiveContactId(mapped.id);
        } else {
          setActiveContactId("");
        }
      })
      .catch((error) => {
        notify.error(error, "Failed to load contacts");
        setRecords([]);
        setActiveContactId("");
      });
  }, [audience]);

  useEffect(() => {
    if (!contacts.length) return;
    const hasActive = contacts.some((contact) => contact.id === activeContactId);
    if (!hasActive) {
      setActiveContactId(contacts[0].id);
    }
  }, [contacts, activeContactId]);

  const loadMessages = async () => {
    if (!activeContact) {
      setMessages([]);
      return;
    }

    const data = await api.getMessages(messageParamsFromContact(activeContact));
    setMessages(data);
  };

  useEffect(() => {
    if (!activeContact) {
      setMessages([]);
      return;
    }

    loadMessages().catch((error) => {
      notify.error(error, "Failed to load messages");
    });
    const interval = window.setInterval(() => {
      loadMessages().catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [activeContactId, activeContact?.id]);

  const handleAudienceChange = (value: InteractionAudience) => {
    setAudience(value);
  };

  const handleSend = async (text: string) => {
    if (!activeContact) return;

    setLoading(true);
    try {
      await api.sendMessage(text, sendParamsFromContact(activeContact));
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

  return {
    auth,
    audience,
    audienceOptions,
    onAudienceChange: handleAudienceChange,
    contacts,
    activeContactId,
    setActiveContactId,
    messages,
    loading,
    handleSend,
    motherMenu: getPanelMotherMenu(auth?.panel),
  };
}

export function AdminInteractionPage() {
  const {
    auth,
    audience,
    audienceOptions,
    onAudienceChange,
    contacts,
    activeContactId,
    setActiveContactId,
    messages,
    loading,
    handleSend,
    motherMenu,
  } = useAdminInteractionPage();

  const emptyHint =
    audience === "group"
      ? "Group messages are sent to all students."
      : audience === "student"
        ? "Select a student to send a private message."
        : audience === "staff"
          ? "Select a staff member to send a private message."
          : "Select an admin to send a private message.";

  return (
    <>
      <PageTitle motherMenu={motherMenu} activeMenu="Interaction" pageContent="" />
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
            sidebarTitle="Interaction"
            emptyThreadHint={emptyHint}
            audience={audience}
            audienceOptions={audienceOptions}
            onAudienceChange={onAudienceChange}
            hideContactList={audience === "group"}
          />
        </div>
      </div>
    </>
  );
}
