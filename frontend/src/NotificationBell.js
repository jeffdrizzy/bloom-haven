import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';
import { brand } from './brand';
import {
  Bell,
  BellOff,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  KeyRound,
  Gift,
  ArrowLeftRight,
  Snowflake,
  Ban,
  CheckCircle2,
  Info,
} from './icons';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${notificationId}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead(notification._id);
    if (notification.link) navigate(notification.link);
    setIsOpen(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit':
        return ArrowDownToLine;
      case 'withdrawal':
        return ArrowUpFromLine;
      case 'kyc':
        return ShieldCheck;
      case 'pin':
        return KeyRound;
      case 'referral':
        return Gift;
      case 'swap':
        return ArrowLeftRight;
      default:
        return Info;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit':
        return brand.colors.success;
      case 'withdrawal':
        return brand.colors.error;
      case 'kyc':
        return brand.colors.primary;
      case 'pin':
        return brand.colors.warning;
      case 'referral':
        return brand.colors.primary;
      case 'swap':
        return brand.colors.accent;
      default:
        return brand.colors.textLight;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition"
        style={{
          background: isOpen ? brand.colors.creamSoft : 'transparent',
          color: brand.colors.primary,
        }}
        aria-label="Notifications"
      >
        <Bell size={22} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: brand.colors.error }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{
            background: brand.colors.surface,
            border: `1px solid ${brand.colors.primarySoft}`,
            maxHeight: '500px',
          }}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center px-4 py-3"
            style={{ borderBottom: `1px solid ${brand.colors.primarySoft}` }}
          >
            <h3 className="font-semibold" style={{ color: brand.colors.text }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium transition hover:opacity-80"
                style={{ color: brand.colors.primary }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellOff
                  size={40}
                  strokeWidth={1.5}
                  style={{ color: brand.colors.textMuted, margin: '0 auto 8px' }}
                />
                <p className="text-sm" style={{ color: brand.colors.textMuted }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = getTypeIcon(notification.type);
                const iconColor = getTypeColor(notification.type);

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition"
                    style={{
                      background: notification.isRead
                        ? 'transparent'
                        : brand.colors.creamSoft,
                      borderBottom: `1px solid ${brand.colors.primarySoft}`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${iconColor}15`,
                        color: iconColor,
                      }}
                    >
                      <IconComponent size={18} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium"
                        style={{ color: brand.colors.text }}
                      >
                        {notification.title}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: brand.colors.textLight }}
                      >
                        {notification.message}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: brand.colors.textMuted }}
                      >
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteNotification(notification._id, e)}
                      className="opacity-50 hover:opacity-100 transition flex-shrink-0"
                      style={{ color: brand.colors.textMuted }}
                      aria-label="Delete notification"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;