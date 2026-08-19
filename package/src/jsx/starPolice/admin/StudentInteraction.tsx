import { useContext } from "react";
import { ThemeContext } from "../../../context/ThemeContext";
import { getPanelMotherMenu } from "../panelLabels";
import { InteractionPage } from "../shared/useInteractionPage";

const StudentInteraction = () => {
  const { auth } = useContext(ThemeContext);

  return (
    <InteractionPage
      includeGroup
      groupContact={{
        title: "All Students",
        subtitle: "Group message to everyone",
        initials: "ALL",
      }}
      pageTitle="Student Interaction"
      activeMenu="Student Interaction"
      motherMenu={getPanelMotherMenu(auth?.panel)}
      sidebarTitle="Student Chats"
      emptyThreadHint="Select Group or a student from the list."
      contactsErrorMessage="Failed to load student list"
      groupSendSuccess="Group message sent to all students."
      privateSendSuccess={(name) => `Message sent to ${name}.`}
    />
  );
};

export default StudentInteraction;
