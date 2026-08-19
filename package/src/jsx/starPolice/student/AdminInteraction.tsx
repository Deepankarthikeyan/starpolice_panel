import { InteractionPage } from "../shared/useInteractionPage";

const AdminInteraction = () => (
  <InteractionPage
    contactScope="admin"
    includeGroup
    groupContact={{
      title: "Group Announcements",
      subtitle: "Messages for all students",
      initials: "GRP",
    }}
    pageTitle="Admin Interaction"
    activeMenu="Admin Interaction"
    motherMenu="Student Panel"
    sidebarTitle="Admin Chats"
    emptyThreadHint="Select Group or an admin from the list."
    contactsErrorMessage="Failed to load admin list"
    groupSendSuccess="Group message sent."
    privateSendSuccess={(name) => `Message sent to ${name}.`}
  />
);

export default AdminInteraction;
