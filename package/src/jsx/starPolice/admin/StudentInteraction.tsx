import InteractionChat from "../shared/InteractionChat";

const StudentInteraction = () => (
  <InteractionChat
    motherMenu="Admin Panel"
    activeMenu="Student Interaction"
    title="Admin & Student Interaction"
    emptyText="No messages yet. Start the conversation with your students."
    placeholder="Reply to students..."
  />
);

export default StudentInteraction;
