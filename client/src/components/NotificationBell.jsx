import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // User might be logged out
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="position-relative">
      <button
        className="btn btn-dark position-relative rounded-circle p-2 d-flex align-items-center justify-content-center"
        style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.08)', border: 'none' }}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <i className="bi bi-bell-fill text-light fs-5"></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 p-3 glass-card shadow-lg"
          style={{ width: '340px', zIndex: 1050, maxHeight: '420px', overflowY: 'auto' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary">
            <h6 className="m-0 fw-bold text-white">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm text-decoration-none text-danger p-0"
                style={{ fontSize: '0.78rem' }}
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted small">No notifications yet</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`p-2 mb-2 rounded ${n.isRead ? 'bg-transparent' : 'bg-dark border-start border-3 border-danger'}`}
                style={{ fontSize: '0.82rem' }}
              >
                <div className="fw-semibold text-white">{n.title}</div>
                <div className="text-muted small">{n.message}</div>
                <div className="text-secondary mt-1" style={{ fontSize: '0.7rem' }}>
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

