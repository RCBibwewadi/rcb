"use client";

import { motion } from "framer-motion";
import { Bell, Check, Heart, User, X } from "lucide-react";
import { MatchUpNotification } from "@/lib/types";

interface NotificationDropdownProps {
  notifications: MatchUpNotification[];
  onClose: () => void;
  onMarkRead: () => void;
}

export default function NotificationDropdown({
  notifications,
  onClose,
  onMarkRead,
}: NotificationDropdownProps) {
  const handleMarkAllRead = async () => {
    await fetch("/api/matchup/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all_read: true }),
    });
    onMarkRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_match":
        return <Heart className="w-4 h-4 text-rose-tan" />;
      case "final_partner":
        return <Heart className="w-4 h-4 text-green-500" />;
      case "reconciliation_match":
        return <Heart className="w-4 h-4 text-luxury-gold" />;
      case "profile_approved":
        return <Check className="w-4 h-4 text-green-500" />;
      case "profile_declined":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-mauve-wine-light" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl luxury-shadow border border-rose-tan-light/30 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 border-b border-rose-tan-light/30">
        <h3 className="font-semibold text-mauve-wine">Notifications</h3>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-rose-tan hover:text-rose-tan-dark"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-8 h-8 text-mauve-wine-light mx-auto mb-2" />
            <p className="text-sm text-mauve-wine-light">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b border-rose-tan-light/20 last:border-0 hover:bg-luxury-cream/50 transition-colors ${
                !notification.is_read ? "bg-rose-tan/5" : ""
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-mauve-wine">
                    {notification.title}
                  </p>
                  <p className="text-xs text-mauve-wine-light mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-mauve-wine-light/50 mt-1">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-rose-tan rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
