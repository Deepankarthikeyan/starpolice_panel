import { useContext, useEffect, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import { ThemeContext } from "../../../context/ThemeContext";
import { api } from "../api";
import { getPanelMotherMenu } from "../panelLabels";
import type { AppNotification } from "../types";

const PanelInbox = () => {
  const { auth } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const items = await api.getNotifications();
      setNotifications(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications().catch(console.error);
  }, []);

  const markRead = async (id: string) => {
    await api.markNotificationRead(id);
    await loadNotifications();
  };

  return (
    <>
      <PageTitle
        motherMenu={getPanelMotherMenu(auth?.panel)}
        activeMenu="Inbox"
        pageContent=""
      />
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">Notifications</h4>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => api.markAllNotificationsRead().then(loadNotifications)}
          >
            Mark all read
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <p className="text-muted mb-0">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-muted mb-0">No notifications yet.</p>
          ) : (
            <div className="list-group list-group-flush">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`list-group-item list-group-item-action text-start ${
                    notification.read ? "" : "fw-semibold"
                  }`}
                  onClick={() => !notification.read && markRead(notification.id)}
                >
                  <div className="d-flex justify-content-between gap-3">
                    <div>
                      <div>{notification.title}</div>
                      <small className="text-muted">{notification.message}</small>
                    </div>
                    <small className="text-muted text-nowrap">
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PanelInbox;
