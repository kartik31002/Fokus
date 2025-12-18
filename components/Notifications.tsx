'use client'

import { useState, useEffect } from 'react'
import { notificationStorage } from '@/lib/storage'
import type { NotificationData } from '@/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = () => {
    const allNotifications = notificationStorage.getAll()
    setNotifications(allNotifications.filter(n => !n.read))
  }

  const createNotification = (data: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    const notification: NotificationData = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    notificationStorage.save(notification)
    loadNotifications()

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.message,
        icon: '/icon.png',
      })
    }
  }

  const markAsRead = (id: string) => {
    notificationStorage.markAsRead(id)
    loadNotifications()
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  return {
    notifications,
    createNotification,
    markAsRead,
    requestNotificationPermission,
  }
}

export default function NotificationBell() {
  const { notifications, markAsRead, requestNotificationPermission } = useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
