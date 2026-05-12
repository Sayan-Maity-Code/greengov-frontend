import { useEffect, useState } from "react";
import {
  getUserNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
} from "../api/notificationApi";

export default function NotificationDropdown({ userId }) {

  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    const data = await getUserNotifications(userId);
    setNotifications(data || []);
  };

  const unreadCount = notifications.filter(n => n.status === "SENT").length;

  const handleRead = async (id) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    loadNotifications();
  };

  const handleMarkAll = async () => {
    await markAllRead(userId);
    loadNotifications();
  };

  return (
    <div className="position-relative">

      {/* 🔔 ICON */}
      <button
        className="btn btn-outline-light position-relative"
        onClick={() => setShow(!show)}
      >
        <i className="fa-solid fa-bell"></i>

        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge bg-danger">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {show && (
        <div className="dropdown-menu show"
          style={{ right: 0, left: "auto", width: "350px", maxHeight: "400px", overflowY: "auto" }}>

          <div className="d-flex justify-content-between px-3 py-2 border-bottom">
            <strong>Notifications</strong>
            <button className="btn btn-sm btn-link" onClick={handleMarkAll}>
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center p-3">No notifications</div>
          ) : (
            notifications.map(n => (
              <div key={n.notificationId} className="dropdown-item">

                <div className="small text-muted">
                  {new Date(n.createdDate).toLocaleString()}
                </div>

                <div className={n.status === "READ" ? "text-muted" : "fw-bold"}>
                  {n.message}
                </div>

                <div className="d-flex gap-2 mt-1">

                  {n.status !== "READ" && (
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleRead(n.notificationId)}
                    >
                      ✓
                    </button>
                  )}

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(n.notificationId)}
                  >
                    🗑
                  </button>

                </div>
              </div>
            ))
          )}

        </div>
      )}

    </div>
  );
}