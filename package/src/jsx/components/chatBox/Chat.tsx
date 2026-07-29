import React, { useContext, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../../starPolice/api";
import { usePolling } from "../../starPolice/usePolling";
import type { ChatMessage } from "../../starPolice/types";
import MsgBox from "./MsgBox";

type ChatProps = {
  toggleTab: string;
  toggleChatBox: boolean;
  toggle?: string;
};

const Chat: React.FC<ChatProps> = ({ toggleChatBox, toggleTab, toggle }) => {
  const [openMsg, setOpenMsg] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { auth } = useContext(ThemeContext);
  const isActive = toggle === "chatbox" && toggleTab === "chat";

  const loadMessages = useCallback(async () => {
    if (!auth?.token) return;
    const data = await api.getMessages();
    setMessages(data);
  }, [auth?.token]);

  usePolling(loadMessages, 10000, Boolean(auth?.token) && isActive);

  const chatTitle =
    auth?.role === "admin" || auth?.role === "staff" || auth?.role === "superadmin" ? "Students" : "Star Police Admin";
  const lastMessage = messages[messages.length - 1];
  const preview = lastMessage
    ? `${lastMessage.senderName}: ${lastMessage.message.slice(0, 40)}`
    : "No messages yet";

  return (
    <div
      className={`tab-pane fade  ${toggleTab === "chat" ? "active show" : ""}`}
      id="chat"
      role="tabpanel"
    >
      <div
        className={`card mb-sm-3 mb-md-0 contacts_card dlab-chat-user-box ${
          openMsg ? "d-none" : ""
        }`}
      >
        <div className="card-header chat-list-header text-center">
          <Link to="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="18px"
              height="18px"
              viewBox="0 0 24 24"
              version="1.1"
            >
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <rect fill="#000000" x="4" y="11" width="16" height="2" rx="1" />
                <rect
                  fill="#000000"
                  opacity="0.3"
                  transform="translate(12.000000, 12.000000) rotate(-270.000000) translate(-12.000000, -12.000000) "
                  x="4"
                  y="11"
                  width="16"
                  height="2"
                  rx="1"
                />
              </g>
            </svg>
          </Link>
          <div>
            <h6 className="mb-1">Chat List</h6>
            <p className="mb-0">Academy Messages</p>
          </div>
          <Link to="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="18px"
              height="18px"
              viewBox="0 0 24 24"
              version="1.1"
            >
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <rect x="0" y="0" width="24" height="24" />
                <circle fill="#000000" cx="5" cy="12" r="2" />
                <circle fill="#000000" cx="12" cy="12" r="2" />
                <circle fill="#000000" cx="19" cy="12" r="2" />
              </g>
            </svg>
          </Link>
        </div>
        <div
          className={`card-body contacts_body p-0 dlab-scroll  ${
            toggleChatBox ? "ps ps--active-y" : ""
          }`}
          id="DZ_W_Contacts_Body"
        >
          <ul className="contacts">
            <li
              className="active dlab-chat-user"
              onClick={() => setOpenMsg(true)}
            >
              <div className="d-flex bd-highlight">
                <div className="img_cont">
                  <div className="rounded-circle user_img d-flex align-items-center justify-content-center bg-primary text-white fw-bold">
                    {auth?.role === "admin" || auth?.role === "staff" || auth?.role === "superadmin" ? "ST" : "AD"}
                  </div>
                  <span className="online_icon"></span>
                </div>
                <div className="user_info">
                  <span>{chatTitle}</span>
                  <p>{preview}</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <MsgBox
        title={chatTitle}
        openMsg={openMsg}
        offMsg={() => setOpenMsg(false)}
        messages={messages}
        onMessageSent={loadMessages}
      />
    </div>
  );
};

export default Chat;
