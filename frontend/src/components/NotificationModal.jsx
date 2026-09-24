import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Mail, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { api } from '../api';

export default function NotificationModal({ onSelectComplaint }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.items || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000); // Polling every 12s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.read) {
      api.markNotificationRead(notif.id).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notif.complaint_id && onSelectComplaint) {
      onSelectComplaint(notif.complaint_id);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_note':
        return <Mail className="w-4 h-4 text-[#722F37]" />;
      case 'response_received':
        return <MessageCircle className="w-4 h-4 text-[#D8A49B]" />;
      case 'completed':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      case 'reaction':
        return <Heart className="w-4 h-4 text-rose-500" />;
      default:
        return <Mail className="w-4 h-4 text-[#722F37]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-[#F5EFEB] border border-[#EADBCC] text-[#722F37] hover:bg-[#F3D8D6]/60 transition-all shadow-xs"
        title="Little whisper notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#8C3B47] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FDFBF7] border border-[#EADBCC] rounded-2xl shadow-2xl p-4 z-50 text-[#3E2723]">
          <div className="flex items-center justify-between border-b border-[#EADBCC] pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💌</span>
              <h4 className="font-serif-display font-semibold text-[#722F37] text-sm">Little Whispers</h4>
              {unreadCount > 0 && (
                <span className="text-xs bg-[#F3D8D6] text-[#722F37] px-2 py-0.5 rounded-full font-serif-vintage">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#6D5B57] hover:text-[#722F37] flex items-center gap-1 font-serif-vintage"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Read all
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-stone-400">
                <p className="font-handwriting text-lg text-[#6D5B57]">Quiet moments in our box…</p>
                <p className="text-xs font-serif-vintage mt-1">No unread whispers right now ♡</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    notif.read
                      ? 'bg-[#FBF7F0]/60 border-[#EADBCC]/50 opacity-75'
                      : 'bg-[#F5EFEB] border-[#D8A49B] shadow-xs'
                  } hover:bg-[#F3D8D6]/40`}
                >
                  <div className="p-1.5 rounded-lg bg-white/80 border border-[#EADBCC]/60 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-serif-vintage leading-relaxed ${!notif.read ? 'font-semibold text-[#3E2723]' : 'text-[#6D5B57]'}`}>
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[#A29288] font-mono block mt-1">
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-[#8C3B47] mt-1 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
