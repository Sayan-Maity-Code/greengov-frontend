import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import {
  getUserNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification
} from "../api/notificationApi";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, getUsername, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ TEMP userId (later get from auth)
  const userId = 4;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  /* ✅ Load notifications */
  useEffect(() => {
    if (isAuthenticated) loadNotifications();
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const data = await getUserNotifications(userId);
      setNotifications(data || []);
    } catch {
      console.log("Failed to load notifications");
    }
  };

  const unreadCount = notifications.filter(n => n.status === "SENT").length;

  /* ✅ Mark as read */
  const handleRead = async (id) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  /* ✅ Delete */
  const handleDelete = async (id) => {
    await deleteNotification(id);
    loadNotifications();
  };

  /* ✅ Mark all */
  const handleMarkAll = async () => {
    await markAllRead(userId);
    loadNotifications();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success border-bottom border-success-subtle sticky-top">
      <div className="container-fluid px-4">

        <Link
          className="navbar-brand fw-bold fs-5 text-white"
          to={isAuthenticated ? "/dashboard" : "/"}
        >
          GreenGov
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3">

            {isAuthenticated ? (
              <>
                {/* ✅ NOTIFICATION */}
                <li className="nav-item dropdown">
                  <button
                    className="btn btn-outline-light position-relative"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <i className="fa-solid fa-bell"></i>

                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge bg-danger">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* ✅ DROPDOWN */}
                  {showDropdown && (
                    <div
                      className="dropdown-menu show p-0 shadow"
                      style={{
                        right: 0,
                        left: "auto",
                        width: "350px",
                        maxHeight: "400px",
                        overflowY: "auto"
                      }}
                    >
                      {/* Header */}
                      <div className="d-flex justify-content-between px-3 py-2 border-bottom">
                        <strong>Notifications</strong>
                        <button
                          className="btn btn-sm btn-link"
                          onClick={handleMarkAll}
                        >
                          Mark all read
                        </button>
                      </div>

                      {/* List */}
                      {notifications.length === 0 ? (
                        <div className="text-center p-3 text-muted">
                          No notifications
                        </div>
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
                                  title="Mark as read"
                                >
                                  ✓
                                </button>
                              )}

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(n.notificationId)}
                                title="Delete"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>

                            </div>

                          </div>
                        ))
                      )}
                    </div>
                  )}
                </li>

                {/* ✅ USER INFO */}
                <li className="nav-item">
                  <span className="nav-link text-white-50 small">
                    Signed in as{" "}
                    <strong className="text-white">{getUsername() || "User"}</strong>
                  </span>
                </li>

                <li className="nav-item">
                  <Link className="nav-link text-white" to="/profile">
                    Profile
                  </Link>
                </li>

                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login">
                    Sign In
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}
