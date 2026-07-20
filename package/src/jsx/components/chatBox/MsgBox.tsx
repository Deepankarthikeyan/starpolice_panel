import { FormEvent, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../../starPolice/api";
import type { ChatMessage } from "../../starPolice/types";

interface MsgBoxProps {
  title: string;
  openMsg: boolean;
  offMsg: () => void;
  messages: ChatMessage[];
  onMessageSent: () => Promise<void>;
}

const MsgBox: React.FC<MsgBoxProps> = ({
  title,
  openMsg,
  offMsg,
  messages,
  onMessageSent,
}) => {
  const [toggle, setToggle] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth } = useContext(ThemeContext);

  useEffect(() => {
    if (!openMsg) return;
    const container = document.getElementById("DZ_W_Contacts_Body3");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, openMsg]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await api.sendMessage(message.trim());
      setMessage("");
      await onMessageSent();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`card chat dlab-chat-history-box ${openMsg ? "" : "d-none"}`}
    >
      <div className="card-header chat-list-header text-center">
        <Link
          to={"#"}
          className="dlab-chat-history-back"
          onClick={() => offMsg()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="18px"
            height="18px"
            viewBox="0 0 24 24"
            version="1.1"
          >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <polygon points="0 0 24 0 24 24 0 24" />
              <rect
                fill="#000000"
                opacity="0.3"
                transform="translate(15.000000, 12.000000) scale(-1, 1) rotate(-90.000000) translate(-15.000000, -12.000000) "
                x="14"
                y="7"
                width="2"
                height="10"
                rx="1"
              />
              <path
                d="M3.7071045,15.7071045 C3.3165802,16.0976288 2.68341522,16.0976288 2.29289093,15.7071045 C1.90236664,15.3165802 1.90236664,14.6834152 2.29289093,14.2928909 L8.29289093,8.29289093 C8.67146987,7.914312 9.28105631,7.90106637 9.67572234,8.26284357 L15.6757223,13.7628436 C16.0828413,14.136036 16.1103443,14.7686034 15.7371519,15.1757223 C15.3639594,15.5828413 14.7313921,15.6103443 14.3242731,15.2371519 L9.03007346,10.3841355 L3.7071045,15.7071045 Z"
                fill="#000000"
                fillRule="nonzero"
                transform="translate(9.000001, 11.999997) scale(-1, -1) rotate(90.000000) translate(-9.000001, -11.999997) "
              />
            </g>
          </svg>
        </Link>
        <div>
          <h6 className="mb-1">Chat with {title}</h6>
          <p className="mb-0 text-success">Online</p>
        </div>
        <div className="dropdown">
          <Link
            to={"#"}
            data-toggle="dropdown"
            aria-expanded="false"
            onClick={() => setToggle(!toggle)}
          >
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
          <ul
            className={`dropdown-menu dropdown-menu-right ${
              toggle ? "show" : ""
            }`}
          >
            <li className="dropdown-item" onClick={() => setToggle(false)}>
              <i className="fa fa-user-circle text-primary me-2"></i> View profile
            </li>
          </ul>
        </div>
      </div>
      <div
        className={`card-body msg_card_body dlab-scroll ${openMsg ? "" : ""} `}
        id="DZ_W_Contacts_Body3"
      >
        {messages.length === 0 ? (
          <p className="text-muted text-center mt-3">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((item) => {
            const isMine =
              item.senderRole === auth?.role ||
              (["admin", "superadmin"].includes(item.senderRole) &&
                ["admin", "superadmin"].includes(auth?.role || ""));
            return (
              <div
                key={item.id}
                className={`d-flex mb-4 ${isMine ? "justify-content-end" : "justify-content-start"}`}
              >
                {!isMine && (
                  <div className="img_cont_msg">
                    <div className="rounded-circle user_img_msg d-flex align-items-center justify-content-center bg-secondary text-white small">
                      {item.senderName.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                )}
                <div className={isMine ? "msg_cotainer_send" : "msg_cotainer"}>
                  <strong className="d-block small mb-1">{item.senderName}</strong>
                  {item.message}
                  <span className={isMine ? "msg_time_send" : "msg_time"}>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                {isMine && (
                  <div className="img_cont_msg">
                    <div className="rounded-circle user_img_msg d-flex align-items-center justify-content-center bg-primary text-white small">
                      {item.senderName.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="card-footer type_msg">
        <form onSubmit={onSubmit} className="input-group">
          <textarea
            className="form-control"
            placeholder="Type your message..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="input-group-append">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <i className="fa fa-location-arrow"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MsgBox;
