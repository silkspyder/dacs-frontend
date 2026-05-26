/**
 * Roles: Admin & Librarian
 *
 * Shows auto-generated alerts for:
 *  - Overdue books (per student)
 *  - Books with low stock (quantity <= 2)
 */

import { useState, useEffect } from 'react';
import { DataStore, IssueBookDetail, BookDetail } from '../data/mockData';
import { Bell, BookOpen, Clock, CheckCheck, AlertTriangle, RefreshCw } from 'lucide-react';

type NotifType = 'overdue' | 'low_stock';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const LOW_STOCK_THRESHOLD = 2;

function getDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function loadReadIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem('lms_notif_read') || '[]'));
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem('lms_notif_read', JSON.stringify([...ids]));
}

function buildNotifications(issues: IssueBookDetail[], books: BookDetail[], readIds: Set<string>): Notification[] {
  const notifs: Notification[] = [];
  const today = new Date().toISOString().split('T')[0];

  //overdue notifications: one per overdue issue
  issues
    .filter((i) => i.status === 'pending' && getDaysOverdue(i.dueDate) > 0)
    .forEach((i) => {
      const days = getDaysOverdue(i.dueDate);
      const id = `overdue_${i.id}`;
      notifs.push({
        id,
        type: 'overdue',
        title: 'Overdue Book',
        message: `"${i.bookName}" borrowed by ${i.studentName} is ${days} day${days > 1 ? 's' : ''} overdue (due ${i.dueDate}). Fine: ₱${days * 5}.`,
        date: today,
        read: readIds.has(id),
      });
    });

  //low stock notifications: one per book below threshold
  books
    .filter((b) => b.quantity <= LOW_STOCK_THRESHOLD)
    .forEach((b) => {
      const id = `stock_${b.bookId}`;
      notifs.push({
        id,
        type: 'low_stock',
        title: b.quantity === 0 ? 'Out of Stock' : 'Low Stock',
        message: `"${b.bookName}" by ${b.author} has only ${b.quantity} cop${b.quantity === 1 ? 'y' : 'ies'} remaining.`,
        date: today,
        read: readIds.has(id),
      });
    });

  //most urgent first
  return notifs.sort((a, b) => (a.read ? 1 : 0) - (b.read ? 1 : 0));
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds]             = useState<Set<string>>(new Set());
  const [filter, setFilter]               = useState<'all' | 'unread' | 'overdue' | 'low_stock'>('unread');
  const [loading, setLoading]             = useState(true);

  const load = async () => {
    setLoading(true);
    const [issues, books] = await Promise.all([DataStore.getIssues(), DataStore.getBooks()]);
    const ids = loadReadIds();
    setReadIds(ids);
    setNotifications(buildNotifications(issues, books, ids));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markRead = (id: string) => {
    const updated = new Set(readIds).add(id);
    setReadIds(updated);
    saveReadIds(updated);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    const updated = new Set(notifications.map((n) => n.id));
    setReadIds(updated);
    saveReadIds(updated);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread')    return !n.read;
    if (filter === 'overdue')   return n.type === 'overdue';
    if (filter === 'low_stock') return n.type === 'low_stock';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Notifications</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700
                text-white text-sm font-medium transition-colors">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'unread',    label: 'Unread' },
          { key: 'all',       label: 'All' },
          { key: 'overdue',   label: 'Overdue' },
          { key: 'low_stock', label: 'Low Stock' },
        ] as const).map(({ key, label }) => (
          <button key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === key
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* notification list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <CheckCheck className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No notifications here.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div key={n.id}
              className={`flex gap-4 p-4 rounded-xl border transition-colors
                ${n.read
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                  : n.type === 'overdue'
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'}`}>
              <div className={`shrink-0 p-2 rounded-lg
                ${n.type === 'overdue'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                {n.type === 'overdue'
                  ? <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  : <BookOpen className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                      {n.title}
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>
                  </div>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)}
                      className="shrink-0 text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600
                        text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-colors">
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Notifications are auto-generated from live issue and book data. Refresh to update.
        </p>
      )}
    </div>
  );
}
