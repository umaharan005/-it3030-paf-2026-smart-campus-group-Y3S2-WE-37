import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import NotificationService from '../services/NotificationService';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:8080/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [token]);

    const handleNewNotification = useCallback((notification) => {
        setNotifications((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === notification.id);
            return existingIndex >= 0
                ? prev.map((item) => item.id === notification.id ? notification : item)
                : [notification, ...prev];
        });
        
        // Show toast for new notification
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                            <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-slate-200">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    }, []);

    useEffect(() => {
        if (user && user.email) { // Using email as the userId identifier for WebSocket
            fetchNotifications();
            NotificationService.connect(user.email, handleNewNotification);

            const pollInterval = setInterval(() => {
                fetchNotifications();
            }, 10000);

            const handleWindowFocus = () => {
                fetchNotifications();
            };

            window.addEventListener('focus', handleWindowFocus);

            return () => {
                clearInterval(pollInterval);
                window.removeEventListener('focus', handleWindowFocus);
                NotificationService.disconnect();
            };
        } else {
            NotificationService.disconnect();
            setNotifications([]);
        }
    }, [user, fetchNotifications, handleNewNotification]);

    const markAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:8080/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
