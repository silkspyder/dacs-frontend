/**
 * Roles: Admin & Librarian
 * Shows all overdue books with auto-calculated fines (₱10/day).
 * Librarian/Admin can mark a fine as paid once the student settles it.
 */

import { useState, useEffect } from 'react';
import { DataStore, IssueBookDetail } from '../data/mockData';
import { AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';

const FINE_RATE = 10; // ₱10 per day overdue

interface FineRecord {
  issueId: number;
  paid: boolean;
  paidDate?: string;
}

function getDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function loadFineRecords(): FineRecord[] {
  try {
    return JSON.parse(localStorage.getItem('lms_fines') || '[]');
  } catch {
    return [];
  }
}

function saveFineRecords(records: FineRecord[]) {
  localStorage.setItem('lms_fines', JSON.stringify(records));
}

export function FineManagement() {
  const [issues, setIssues]         = useState<IssueBookDetail[]>([]);
  const [fineRecords, setFineRecords] = useState<FineRecord[]>([]);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<'all' | 'unpaid' | 'paid'>('unpaid');
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const all = await DataStore.getIssues();
      setIssues(all);
      setFineRecords(loadFineRecords());
      setLoading(false);
    };
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  //only issues that are overdue (pending + past due date)
  const overdueIssues = issues.filter(
    (i) => i.status === 'pending' && getDaysOverdue(i.dueDate) > 0
  );

  const enriched = overdueIssues.map((issue) => {
    const days  = getDaysOverdue(issue.dueDate);
    const fine  = days * FINE_RATE;
    const rec   = fineRecords.find((r) => r.issueId === issue.id);
    return { ...issue, daysOverdue: days, fine, paid: rec?.paid ?? false, paidDate: rec?.paidDate };
  });

  const filtered = enriched.filter((e) => {
    const matchSearch =
      e.bookName.toLowerCase().includes(search.toLowerCase()) ||
      e.studentName.toLowerCase().includes(search.toLowerCase());
    if (filter === 'unpaid') return matchSearch && !e.paid;
    if (filter === 'paid')   return matchSearch && e.paid;
    return matchSearch;
  });

  const totalUnpaid = enriched.filter((e) => !e.paid).reduce((s, e) => s + e.fine, 0);
  const totalPaid   = enriched.filter((e) => e.paid).length;

  const markPaid = (issueId: number) => {
    const updated = fineRecords.filter((r) => r.issueId !== issueId);
    updated.push({ issueId, paid: true, paidDate: new Date().toISOString().split('T')[0] });
    setFineRecords(updated);
    saveFineRecords(updated);
    showToast('Fine marked as paid.');
  };

  const markUnpaid = (issueId: number) => {
    const updated = fineRecords.filter((r) => r.issueId !== issueId);
    setFineRecords(updated);
    saveFineRecords(updated);
    showToast('Fine marked as unpaid.');
  };

  return (
    <div className="space-y-6">

      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white text-sm">
          <CheckCircle className="w-4 h-4" />{toast}
        </div>
      )}

      {/* header */}
      <div className="flex items-center gap-3">
        <div className="bg-red-600 p-3 rounded-lg">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Fine Management</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Overdue books — ₱{FINE_RATE}/day fine rate</p>
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Total Overdue Books</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-300">{overdueIssues.length}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Total Unpaid Fines</p>
          <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">₱{totalUnpaid.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Fines Settled</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{totalPaid}</p>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by book or student…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
              focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-2">
          {(['unpaid', 'paid', 'all'] as const).map((f) => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                ${filter === f
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            {filter === 'unpaid' ? '🎉 No unpaid fines!' : 'No records found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  {['Book', 'Student', 'Due Date', 'Days Overdue', 'Fine', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-white">{row.bookName}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{row.studentName}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{row.dueDate}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />{row.daysOverdue}d
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-orange-600 dark:text-orange-400">
                      ₱{row.fine.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      {row.paid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" /> Paid {row.paidDate && `· ${row.paidDate}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          <AlertCircle className="w-3 h-3" /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {row.paid ? (
                        <button onClick={() => markUnpaid(row.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          Undo
                        </button>
                      ) : (
                        <button onClick={() => markPaid(row.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
