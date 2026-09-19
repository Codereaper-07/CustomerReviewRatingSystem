import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications.js';
import { formatRelativeTime } from '../../../utils/formatters.js';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isMarkingAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    if (item.link) {
      setIsOpen(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'review_removed':
        return <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />;
      case 'report_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 'report_dismissed':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 border-2 border-black rounded-lg bg-white hover:bg-amber-100 transition-colors cursor-pointer shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4 text-black stroke-[2.5]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-rose-500 border-1.5 border-black rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-[1px_1px_0_0_#000]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 neo-card p-0 bg-white shadow-[4px_4px_0_0_#000] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3 bg-amber-300 border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-sm text-slate-900">
              <Bell className="w-4 h-4 stroke-[2.5]" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="neo-badge bg-black text-white text-[10px] py-0 px-1.5">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-1 text-[11px] font-black text-slate-800 hover:text-black hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y-2 divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 transition-colors cursor-pointer flex gap-3 items-start ${
                    item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-amber-50/60 hover:bg-amber-100/50'
                  }`}
                >
                  {getIcon(item.type)}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-xs text-slate-900 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 leading-snug">
                      {item.message}
                    </p>
                    {item.link && (
                      <Link
                        to={item.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:underline pt-1"
                      >
                        View product <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 border border-black shrink-0 mt-1" />
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

export default NotificationBell;
