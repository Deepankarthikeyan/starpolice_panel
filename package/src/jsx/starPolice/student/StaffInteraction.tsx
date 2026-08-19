import { InteractionPage } from "../shared/useInteractionPage";

const StaffInteraction = () => (
  <InteractionPage
    contactScope="staff"
    includeGroup={false}
    pageTitle="Staff Interaction"
    activeMenu="Staff Interaction"
    motherMenu="Student Panel"
    sidebarTitle="Staff Chats"
    emptyThreadHint="Select a staff member from the list."
    contactsErrorMessage="Failed to load staff list"
    groupSendSuccess="Message sent."
    privateSendSuccess={(name) => `Message sent to ${name}.`}
  />
);

export default StaffInteraction;
