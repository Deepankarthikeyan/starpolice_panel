import InteractionChat from "../shared/InteractionChat";

const StudentInteraction = () => (
  <InteractionChat
    motherMenu="Student Panel"
    activeMenu="Admin Interaction"
    title="Chat with Admin"
    emptyText="No messages yet. Ask your admin a question."
    placeholder="Message admin..."
  />
);

export default StudentInteraction;
