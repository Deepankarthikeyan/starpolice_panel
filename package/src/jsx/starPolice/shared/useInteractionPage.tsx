import { useContext, useEffect, useMemo, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { notify } from "../toast";
import {
  InteractionMessenger,
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

type InteractionPageConfig = {
  contactScope?: "admin" | "staff";
  includeGroup?: boolean;
  groupContact?: {
    title: string;
    subtitle: string;
    initials?: string;
  };
  pageTitle: string;
  activeMenu: string;
  motherMenu?: string;
  sidebarTitle: string;
  emptyThreadHint: string;
  contactsErrorMessage: string;
  groupSendSuccess: string;
  privateSendSuccess: (name: string) => string;
};

export function useInteractionPage(config: InteractionPageConfig) {
  const { auth } = useContext(ThemeContext);
  const [records, setRecords] = useState<MessagingContact[]>([]);
  const [activeContactId, setActiveContactId] = useState(
    config.includeGroup ? GROUP_CONTACT_ID : ""
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const contacts = useMemo<MessengerContact[]>(() => {
    const mapped = records.map(messagingRecordToContact);
    if (!config.includeGroup) {
      return mapped;
    }

    const groupContact = buildGroupContact(
      config.groupContact ?? {
        title: "Group",
        subtitle: "Group messages",
        initials: "GRP",
      }
    );

    return [groupContact, ...mapped];
  }, [config.groupContact, config.includeGroup, records]);

  const activeContact =
    contacts.find((contact) => contact.id === activeContactId) ?? contacts[0] ?? null;

  useEffect(() => {
    api
      .getMessageContacts(config.contactScope)
      .then(setRecords)
      .catch((error) => {
        notify.error(error, config.contactsErrorMessage);
      });
  }, [config.contactScope, config.contactsErrorMessage]);

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

  const handleSend = async (text: string) => {
    if (!activeContact) return;

    setLoading(true);
    try {
      await api.sendMessage(text, sendParamsFromContact(activeContact));
      await loadMessages();
      notify.success(
        activeContact.kind === "group"
          ? config.groupSendSuccess
          : config.privateSendSuccess(activeContact.title)
      );
    } catch (error) {
      notify.error(error, "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return {
    auth,
    contacts,
    activeContactId,
    setActiveContactId,
    messages,
    loading,
    handleSend,
    pageTitle: config.pageTitle,
    activeMenu: config.activeMenu,
    motherMenu: config.motherMenu,
    sidebarTitle: config.sidebarTitle,
    emptyThreadHint: config.emptyThreadHint,
  };
}

export function InteractionPage(config: InteractionPageConfig) {
  const {
    auth,
    contacts,
    activeContactId,
    setActiveContactId,
    messages,
    loading,
    handleSend,
    activeMenu,
    motherMenu = "Student Panel",
    sidebarTitle,
    emptyThreadHint,
  } = useInteractionPage(config);

  return (
    <>
      <PageTitle motherMenu={motherMenu} activeMenu={activeMenu} pageContent="" />
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
            viewerId={auth?.id}
            viewerEmail={auth?.email}
            sidebarTitle={sidebarTitle}
            emptyThreadHint={emptyThreadHint}
          />
        </div>
      </div>
    </>
  );
}
