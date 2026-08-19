import { useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
import { getPanelMotherMenu } from "../panelLabels";
import { InteractionPage } from "../shared/useInteractionPage";

const StaffInteraction = () => {
  const { auth } = useContext(ThemeContext);

  return (
    <InteractionPage
      includeGroup
      groupContact={{
        title: "All Students",
        subtitle: "Group message to everyone",
        initials: "ALL",
      }}
      pageTitle="Staff Interaction"
      activeMenu="Staff Interaction"
      motherMenu={getPanelMotherMenu(auth?.panel)}
      sidebarTitle="Staff Chats"
      emptyThreadHint="Select Group, a student, or an admin from the list."
      contactsErrorMessage="Failed to load contacts"
      groupSendSuccess="Group message sent to all students."
      privateSendSuccess={(name) => `Message sent to ${name}.`}
    />
  );
};

export default StaffInteraction;
