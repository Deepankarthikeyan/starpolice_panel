import { useState } from "react";
import { Link } from "react-router-dom";
import Notes from "../components/chatBox/Notes";
import Alerts from "../components/chatBox/Alerts";
import Chat from "../components/chatBox/Chat";

// Define types for the props
interface ChatBoxProps {
  onClick: () => void;
  toggle?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onClick, toggle }) => {
  const [toggleTab, settoggleTab] = useState<string>(
    window.location.hash.slice(1) ? window.location.hash.slice(1) : "chat"
  );

  const dataToggle = [
    { href: "#notes", name: "Notes" },
    { href: "#alerts", name: "Alerts" },
    { href: "#chat", name: "Chat" },
  ];

  return (
    <div className={`chatbox ${toggle === "chatbox" ? "active" : ""}`}>
      <div className="chatbox-close" onClick={onClick}></div>
      <div className="custom-tab-1">
        <ul className="nav nav-tabs">
          {dataToggle.map((data, i) => (
            <li className="nav-item" key={i}>
              <Link
                className={`nav-link ${
                  toggleTab === data.name.toLocaleLowerCase() ? "active" : ""
                }`}
                data-toggle="tab"
                to={`${data.href}`}
                onClick={() => settoggleTab(data.name.toLocaleLowerCase())}
              >
                {data.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="tab-content">
          <Chat toggle={toggle} toggleTab={toggleTab} toggleChatBox={false} />
          <Notes toggle={toggle} toggleTab={toggleTab} toggleChatBox={false} />
          <Alerts toggle={toggle} toggleTab={toggleTab} toggleChatBox={false} />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
