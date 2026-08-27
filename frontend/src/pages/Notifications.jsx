import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Icon from '../components/Icon';
import './Notifications.css';

const typeMeta = {
  'Appointment Update': { icon: 'calendar', className: 'notif-icon-blue' },
  'New Appointment Request': { icon: 'calendar', className: 'notif-icon-blue' },
  'Lab Results Available': { icon: 'flask', className: 'notif-icon-green' },
  'Overdue Invoice': { icon: 'creditCard', className: 'notif-icon-red' },
  'Prescription Renewal Due': { icon: 'pill', className: 'notif-icon-amber' },
};

function metaFor(title) {
  return typeMeta[title] || { icon: 'bell', className: 'notif-icon-gray' };
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div>
      <div className="notif-header-row">
        <div className="notif-tabs">
          <button
            className={`notif-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`notif-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button className="notif-mark-all" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      {loading ? (
        <p className="notif-empty">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="notif-empty">No notifications.</p>
      ) : (
        <div className="notif-list">
          {visible.map((n) => {
            const meta = metaFor(n.title);
            return (
              <div
                key={n.id}
                className={`notif-card ${!n.read ? 'unread' : ''}`}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div className={`notif-icon ${meta.className}`}>
                  <Icon name={meta.icon} size={18} strokeWidth={1.8} />
                </div>
                <div className="notif-body">
                  <div className="notif-top-row">
                    <span className="notif-title">{n.title}</span>
                    <span className="notif-time">
                      {timeAgo(n.createdAt)}
                      {!n.read && <span className="notif-dot" />}
                    </span>
                  </div>
                  <p className="notif-message">{n.message}</p>
                  {n.priority === 'HIGH' && (
                    <span className="notif-priority-badge">HIGH PRIORITY</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}