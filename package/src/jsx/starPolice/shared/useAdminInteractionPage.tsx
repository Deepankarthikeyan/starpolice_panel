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
import type { AuthUser, ChatMessage, MessagingContact } from "../types";

export type InteractionAudience = "group" | "student" | "staff" | "admin";

export type PanelInteractionConfig = {
  activeMenu: string;
  sidebarTitle?: string;
  defaultAudience?: InteractionAudience;
  groupContact?: {
    title: string;
    subtitle: string;
    initials?: string;
  };
  audienceOptions: (
    auth: AuthUser | null | undefined
  ) => InteractionAudienceOption[];
  emptyHint: (audience: InteractionAudience) => string;
  groupSendSuccess?: string;
  privateSendSuccess?: (name: string) => string;
};

function audienceScope(audience: InteractionAudience): "student" | "staff" | "admin" | undefined {
  if (audience === "group") return undefined;
  return audience;
}

export const ADMIN_INTERACTION_CONFIG: PanelInteractionConfig = {
  activeMenu: "Interaction",
  sidebarTitle: "Interaction",
  defaultAudience: "group",
  groupContact: {
    title: "Group Message",
    subtitle: "Send to all students",
    initials: "ALL",
  },
  audienceOptions: (auth) => {
    const options: InteractionAudienceOption[] = [
      { value: "group", label: "Group" },
      { value: "student", label: "Student" },
    ];
    if (auth?.role === "superadmin") {
      options.push({ value: "staff", label: "Staff" }, { value: "admin", label: "Admin" });
    }
    return options;
  },
  emptyHint: (audience) => {
    if (audience === "group") return "Group messages are sent to all students.";
    if (audience === "student") return "Select a student to send a private message.";
    if (audience === "staff") return "Select a staff member to send a private message.";
    return "Select an admin to send a private message.";
  },
  groupSendSuccess: "Group message sent to all students.",
  privateSendSuccess: (name) => `Message sent to ${name}.`,
};

export const STUDENT_INTERACTION_CONFIG: PanelInteractionConfig = {
  activeMenu: "Interaction",
  sidebarTitle: "Interaction",
  defaultAudience: "group",
  groupContact: {
    title: "Group Message",
    subtitle: "Messages for all students",
    initials: "ALL",
  },
  audienceOptions: () => [
    { value: "group", label: "Group" },
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Staff" },
  ],
  emptyHint: (audience) => {
    if (audience === "group") return "Group announcements for all students.";
    if (audience === "admin") return "Select an admin to send a private message.";
    return "Select a staff member to send a private message.";
  },
  groupSendSuccess: "Group message sent.",
  privateSendSuccess: (name) => `Message sent to ${name}.`,
};

export const STAFF_INTERACTION_CONFIG: PanelInteractionConfig = {
  activeMenu: "Interaction",
  sidebarTitle: "Interaction",
  defaultAudience: "group",
  groupContact: {
    title: "Group Message",
    subtitle: "Send to all students",
    initials: "ALL",
  },
  audienceOptions: () => [
    { value: "group", label: "Group" },
    { value: "student", label: "Student" },
    { value: "admin", label: "Admin" },
  ],
  emptyHint: (audience) => {
    if (audience === "group") return "Group messages are sent to all students.";
    if (audience === "student") return "Select a student to send a private message.";
    return "Select an admin to send a private message.";
  },
  groupSendSuccess: "Group message sent to all students.",
  privateSendSuccess: (name) => `Message sent to ${name}.`,
};

export function usePanelInteractionPage(config: PanelInteractionConfig) {
  const { auth } = useContext(ThemeContext);
  const groupContact = useMemo(
    () =>
      buildGroupContact(
        config.groupContact ?? {
          title: "Group Message",
          subtitle: "Send to all students",
          initials: "ALL",
        }
      ),
    [config.groupContact]
  );
  const audienceOptions = useMemo(() => config.audienceOptions(auth), [auth, config]);
  const [audience, setAudience] = useState<InteractionAudience>(
    config.defaultAudience ?? "group"
  );
  const [records, setRecords] = useState<MessagingContact[]>([]);
  const [activeContactId, setActiveContactId] = useState(GROUP_CONTACT_ID);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const contacts = useMemo<MessengerContact[]>(() => {
    if (audience === "group") {
      return [groupContact];
    }
    return records.map(messagingRecordToContact);
  }, [audience, groupContact, records]);

  const activeContact =
    contacts.find((contact) => contact.id === activeContactId) ?? contacts[0] ?? null;

  useEffect(() => {
    const allowed = audienceOptions.some((option) => option.value === audience);
    if (!allowed && audienceOptions[0]) {
      setAudience(audienceOptions[0].value);
    }
  }, [audience, audienceOptions]);

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
          setActiveContactId(messagingRecordToContact(first).id);
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
          ? config.groupSendSuccess ?? "Group message sent."
          : (config.privateSendSuccess?.(activeContact.title) ??
              `Message sent to ${activeContact.title}.`)
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
    activeMenu: config.activeMenu,
    sidebarTitle: config.sidebarTitle ?? "Interaction",
    emptyHint: config.emptyHint(audience),
  };
}

export function PanelInteractionPage({ config }: { config: PanelInteractionConfig }) {
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
    activeMenu,
    sidebarTitle,
    emptyHint,
  } = usePanelInteractionPage(config);

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

export function AdminInteractionPage() {
  return <PanelInteractionPage config={ADMIN_INTERACTION_CONFIG} />;
}

export function useAdminInteractionPage() {
  return usePanelInteractionPage(ADMIN_INTERACTION_CONFIG);
}
