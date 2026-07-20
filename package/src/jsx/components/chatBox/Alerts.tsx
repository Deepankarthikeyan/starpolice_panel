import React, { FormEvent, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../../starPolice/api";
import type { AcademyAlert } from "../../starPolice/types";

type AlertsProps = {
  toggleTab: string;
  toggleChatBox: boolean;
  toggle?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const categoryLabel: Record<AcademyAlert["category"], string> = {
  general: "GENERAL",
  server: "SERVER STATUS",
  social: "SOCIAL",
};

const Alerts: React.FC<AlertsProps> = ({ toggleTab, toggleChatBox }) => {
  const [alerts, setAlerts] = useState<AcademyAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { auth } = useContext(ThemeContext);
  const isAdmin = auth?.role === "admin" || auth?.role === "superadmin";

  const loadAlerts = async () => {
    if (!auth?.token) return;
    const data = await api.getAlerts();
    setAlerts(data);
  };

  useEffect(() => {
    loadAlerts().catch(console.error);
    const interval = setInterval(() => {
      loadAlerts().catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, [auth?.token]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setLoading(true);
    try {
      await api.createAlert(title.trim(), message.trim());
      setTitle("");
      setMessage("");
      setShowForm(false);
      await loadAlerts();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const groupedAlerts = alerts.reduce<Record<string, AcademyAlert[]>>((groups, alert) => {
    const key = categoryLabel[alert.category] || "GENERAL";
    if (!groups[key]) groups[key] = [];
    groups[key].push(alert);
    return groups;
  }, {});

  return (
    <div
      className={`tab-pane fade ${toggleTab === "alerts" ? "active show" : ""}`}
      id="alerts"
      role="tabpanel"
    >
      <div className="card mb-sm-3 mb-md-0 contacts_card">
        <div className="card-header chat-list-header text-center">
          <Link
            to="#"
            onClick={(event) => {
              event.preventDefault();
              if (isAdmin) setShowForm((value) => !value);
            }}
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
          <div>
            <h6 className="mb-1">Alerts</h6>
            <p className="mb-0">{isAdmin ? "Post Academy Alert" : "Academy Alerts"}</p>
          </div>
          <Link to="#" onClick={(event) => event.preventDefault()}>
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
                <path
                  d="M14.2928932,16.7071068 C13.9023689,16.3165825 13.9023689,15.6834175 14.2928932,15.2928932 C14.6834175,14.9023689 15.3165825,14.9023689 15.7071068,15.2928932 L19.7071068,19.2928932 C20.0976311,19.6834175 20.0976311,20.3165825 19.7071068,20.7071068 C19.3165825,21.0976311 18.6834175,21.0976311 18.2928932,20.7071068 L14.2928932,16.7071068 Z"
                  fill="#000000"
                  fillRule="nonzero"
                  opacity="0.3"
                />
                <path
                  d="M11,16 C13.7614237,16 16,13.7614237 16,11 C16,8.23857625 13.7614237,6 11,6 C8.23857625,6 6,8.23857625 6,11 C6,13.7614237 8.23857625,16 11,16 Z M11,18 C7.13400675,18 4,14.8659932 4,11 C4,7.13400675 7.13400675,4 11,4 C14.8659932,4 18,7.13400675 18,11 C18,14.8659932 14.8659932,18 11,18 Z"
                  fill="#000000"
                  fillRule="nonzero"
                />
              </g>
            </svg>
          </Link>
        </div>

        {showForm && isAdmin && (
          <div className="card-body border-bottom p-3">
            <form onSubmit={onSubmit}>
              <input
                className="form-control mb-2"
                placeholder="Alert title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <textarea
                className="form-control mb-2"
                rows={2}
                placeholder="Alert message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                Post Alert
              </button>
            </form>
          </div>
        )}

        <div
          className={`card-body contacts_body p-0 dlab-scroll ${
            toggleChatBox ? "ps ps--active-y" : ""
          }`}
          id="DZ_W_Contacts_Body1"
        >
          <ul className="contacts">
            {alerts.length === 0 ? (
              <li className="p-3 text-muted text-center">No alerts yet.</li>
            ) : (
              Object.entries(groupedAlerts).map(([group, items]) => (
                <React.Fragment key={group}>
                  <li className="name-first-letter">{group}</li>
                  {items.map((alert) => (
                    <li key={alert.id}>
                      <div className="d-flex bd-highlight">
                        <div className="img_cont primary">{getInitials(alert.createdByName)}</div>
                        <div className="user_info">
                          <span>{alert.title}</span>
                          <p>{alert.message}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </React.Fragment>
              ))
            )}
          </ul>
        </div>
        <div className="card-footer"></div>
      </div>
    </div>
  );
};

export default Alerts;
