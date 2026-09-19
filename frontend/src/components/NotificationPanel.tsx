import { useState, useEffect } from 'react';
import { notificationService, Notification } from '../services/notificationService';

interface NotificationPanelProps {
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export default function NotificationPanel({ onClose, onNavigate }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      await notificationService.fetchAllNotifications();
      setNotifications(notificationService.getNotifications());
      setLoading(false);
    };

    loadNotifications();

    const unsubscribe = notificationService.subscribe((newNotifs) => {
      setNotifications(newNotifs);
    });
    notificationService.startAutoRefresh(5);

    return () => {
      unsubscribe();
      notificationService.stopAutoRefresh();
    };
  }, []);
  
  const handleNotificationClick = (notification: Notification) => {
    onNavigate(notification.actionLink);
    onClose();
  };

  const formatAmount = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const urgencyClass = (days: number) => {
    return days <= 0 ? 'urgent' : days <= 7 ? 'soon' : 'normal';
  };

  const urgencyLabel = (days: number) => {
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days}d`;
  };

  const urgencyColor = (days: number) => {
    return days <= 0 ? '#D93B55' : days <= 7 ? '#C2410C' : '#DB5B1F';
  };

  const overdue = notifications.filter(n => n.daysUntilDue <= 0).length;
  const thisWeek = notifications.filter(n => n.daysUntilDue > 0 && n.daysUntilDue <= 7).length;
  const upcoming = notifications.filter(n => n.daysUntilDue > 7).length;

  return (
    <div className="NP-wrap">
      <div style={{
        height: 3,
        background: overdue > 0
          ? 'linear-gradient(to right,#D93B55,#F0834D)'
          : 'linear-gradient(to right,#F0834D,#C2410C)',
        borderRadius: '16px 16px 0 0'
      }} />

      <div className="NP-head">
        <div className="NP-title">
          <svg width="14" height="14" fill="none" stroke={overdue > 0 ? '#D93B55' : '#C2410C'} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Payment Reminders
          {notifications.length > 0 && <span className="NP-count">{notifications.length}</span>}
        </div>
        <button className="NP-clear" onClick={onClose}>Close ×</button>
      </div>

      {notifications.length > 0 && (
        <div style={{ padding: '8px 12px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {overdue > 0 && (
            <span style={{
              fontFamily: 'JetBrains Mono,monospace', fontSize: 7, fontWeight: 800,
              padding: '3px 9px', borderRadius: 100,
              background: 'rgba(217,59,85,.1)', color: '#D93B55',
              border: '1px solid rgba(217,59,85,.22)'
            }}>
              {overdue} OVERDUE
            </span>
          )}
          {thisWeek > 0 && (
            <span style={{
              fontFamily: 'JetBrains Mono,monospace', fontSize: 7, fontWeight: 800,
              padding: '3px 9px', borderRadius: 100,
              background: 'rgba(37,99,235,.1)', color: '#C2410C',
              border: '1px solid rgba(37,99,235,.22)'
            }}>
              {thisWeek} THIS WEEK
            </span>
          )}
          {upcoming > 0 && (
            <span style={{
              fontFamily: 'JetBrains Mono,monospace', fontSize: 7, fontWeight: 800,
              padding: '3px 9px', borderRadius: 100,
              background: 'rgba(40,112,204,.1)', color: '#DB5B1F',
              border: '1px solid rgba(40,112,204,.22)'
            }}>
              {upcoming} UPCOMING
            </span>
          )}
        </div>
      )}

      <div className="NP-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="SK" style={{ width: '100%', height: 60, borderRadius: 8 }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="NP-empty">
            <svg width="32" height="32" fill="none" stroke="rgba(37,99,235,0.25)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 10 }}>
              <path d="M5 13l4 4L19 7" />
            </svg>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 800, color: 'var(--d-ice)', marginBottom: 4 }}>All Caught Up!</div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, letterSpacing: '1px' }}>No pending payments</div>
          </div>
        ) : (
          notifications.map((notif, i) => {
            const uc = urgencyClass(notif.daysUntilDue);
            const col = urgencyColor(notif.daysUntilDue);
            return (
              <div
                key={notif.id}
                className={`NP-item ${uc}`}
                style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className={`NP-dot ${uc}`}>
                  <svg width="14" height="14" fill="none" stroke={col} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    {uc === 'urgent' ? (
                      <><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></>
                    ) : (
                      <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>
                    )}
                  </svg>
                </div>
                <div className="NP-info">
                  <div className="NP-client">{notif.title}</div>
                  <div className="NP-proj">{notif.message}</div>
                  <div className="NP-meta">
                    <span className="NP-amt" style={{ color: col }}>{formatAmount(notif.amount)}</span>
                    <span className={`NP-days ${uc}`}>{urgencyLabel(notif.daysUntilDue)}</span>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: 'var(--d-ice4)' }}>{notif.dueDate}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0, paddingTop: 2 }}>
                  <svg width="12" height="12" fill="none" stroke="var(--d-ice4)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div style={{
          padding: '10px 14px', borderTop: '1px solid var(--d-line)',
          background: '#F5F3EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, color: 'var(--d-ice4)', letterSpacing: '1px' }}>
            Click any item to view details
          </span>
          <button
            onClick={() => onNavigate('/client')}
            style={{
              fontFamily: 'JetBrains Mono,monospace', fontSize: 7.5, fontWeight: 800,
              padding: '5px 12px', borderRadius: 7,
              background: 'linear-gradient(135deg,#C2410C,#F0834D)',
              color: '#faf9f7', border: 'none', cursor: 'pointer', letterSpacing: '1px'
            }}
          >
            VIEW ALL →
          </button>
        </div>
      )}
    </div>
  );
}