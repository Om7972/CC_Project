import React from 'react';
import { Bell } from 'lucide-react';
import { FeatureShell } from './_FeatureShell';
import { useNotificationStore } from '../store/notificationStore';
import { getSocketClient } from '../lib/socket';

export function NotificationCenterPage() {
  const { notifications, unreadCount, addNotification, markRead } = useNotificationStore();
  React.useEffect(() => {
    const socket = getSocketClient();
    const handler = (payload) => addNotification({ id: Date.now(), read: false, ...payload });
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [addNotification]);

  return (
    <FeatureShell title="Notification Center" subtitle="Real-time updates from orders, chat, and promotions.">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="mb-4 flex items-center gap-3 text-white"><Bell className="animate-pulse" /> Unread: {unreadCount}</div>
        <div className="space-y-2">
          {notifications.map((n) => (
            <button key={n.id} onClick={() => markRead(n.id)} className="block w-full rounded-xl border border-slate-800 px-4 py-3 text-left text-slate-200 hover:bg-slate-800/60">
              {n.message || 'Notification'}
            </button>
          ))}
        </div>
      </div>
    </FeatureShell>
  );
}
