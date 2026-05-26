/**
 * Roles: Admin & Librarian (review all), Student (view own)
 * - Staff can approve (issues the book) or decline with a note.
 * - Students see only their own requests and their statuses.
 *
 * Spacing adjustments need to be made for better readability
 */

import { useState, useEffect } from 'react';
import { DataStore, BorrowRequest } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList, CheckCircle, XCircle, Clock, Trash2,
  AlertCircle, Calendar, X,
} from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'approved' | 'declined';

const STATUS_META = {
  pending:  { label: 'Pending',  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-400',  icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100    dark:bg-red-900/30    text-red-700    dark:text-red-400',    icon: XCircle },
} as const;
//irecheck sa reference code and ai just in case.
export function BorrowRequests() {
  const { user }             = useAuth();
  const isStaff              = user?.usertype === 'Admin' || user?.usertype === 'Librarian';

  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [filter, setFilter]     = useState<StatusFilter>('all');
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  //review modal
  const [reviewTarget, setReviewTarget] = useState<BorrowRequest | null>(null);
  const [issueDate, setIssueDate]       = useState('');
  const [dueDate, setDueDate]           = useState('');
  const [librarianNote, setLibrarianNote] = useState('');
  const [reviewing, setReviewing]       = useState(false);

  useEffect(() => {
    load();
    const today = new Date().toISOString().split('T')[0];
    setIssueDate(today);
    const due = new Date();
    due.setDate(due.getDate() + 14);
    setDueDate(due.toISOString().split('T')[0]);
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = isStaff
        ? await DataStore.getBorrowRequests()
        : await DataStore.getMyBorrowRequests(user.id);
      setRequests(data);
    } catch {
      showToast('Failed to load requests', false);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };
  //requires adjustment to be admin & librarian only
  //done, had to tweak some parts. should be viable to other functions
  const handleApprove = async () => {
    if (!reviewTarget) return;
    setReviewing(true);
    try {
      await DataStore.approveBorrowRequest(reviewTarget.id, issueDate, dueDate, librarianNote || undefined);
      showToast(`Approved — "${reviewTarget.bookName}" has been issued.`);
      setReviewTarget(null);
      setLibrarianNote('');
      await load();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve', false);
    } finally {
      setReviewing(false);
    }
  };

  const handleDecline = async () => {
    if (!reviewTarget) return;
    setReviewing(true);
    try {
      await DataStore.declineBorrowRequest(reviewTarget.id, librarianNote || undefined);
      showToast('Request declined.');
      setReviewTarget(null);
      setLibrarianNote('');
      await load();
    } catch {
      showToast('Failed to decline', false);
    } finally {
      setReviewing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await DataStore.deleteBorrowRequest(id);
      showToast('Request removed.');
      await load();
    } catch {
      showToast('Failed to delete', false);
    }
  };

  const filtered = requests.filter((r) => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">

      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm
          ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="bg-indigo-600 p-3 rounded-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          {isStaff && pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Borrow Requests</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isStaff
              ? `${pendingCount} pending request${pendingCount !== 1 ? 's' : ''} to review`
              : 'Track your book borrow requests'}
          </p>
        </div>
      </div>

      {/* filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'declined'] as const).map((f) => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const meta = STATUS_META[req.status as keyof typeof STATUS_META];
            const StatusIcon = meta.icon;
            return (
              <div key={req.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-800 dark:text-white">{req.bookName}</h4>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                        <StatusIcon className="w-3 h-3" />{meta.label}
                      </span>
                    </div>
                    {isStaff && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Requested by: <span className="font-medium text-gray-700 dark:text-gray-300">{req.studentName}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Requested: {req.requestDate}
                      {req.preferredDueDate && ` · Preferred return: ${req.preferredDueDate}`}
                    </div>
                    {req.librarianNote && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Note: "{req.librarianNote}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isStaff && req.status === 'pending' && (
                      <button
                        onClick={() => { setReviewTarget(req); setLibrarianNote(''); }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
                        Review
                      </button>
                    )}
                    {(isStaff || req.status === 'pending') && (
                      <button onClick={() => handleDelete(req.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* review modal */}
      {reviewTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white">Review Borrow Request</h3>
              <button onClick={() => setReviewTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm space-y-1">
              <p className="font-medium text-gray-800 dark:text-white">{reviewTarget.bookName}</p>
              <p className="text-gray-500 dark:text-gray-400">Student: {reviewTarget.studentName}</p>
              <p className="text-gray-500 dark:text-gray-400">Requested: {reviewTarget.requestDate}</p>
              {reviewTarget.preferredDueDate && (
                <p className="text-gray-500 dark:text-gray-400">Preferred return: {reviewTarget.preferredDueDate}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Issue Date</label>
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Note to student <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea value={librarianNote} onChange={(e) => setLibrarianNote(e.target.value)}
                placeholder="e.g. Please pick up the book at the front desk."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm resize-none
                  focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setReviewTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleDecline} disabled={reviewing}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
                Decline
              </button>
              <button onClick={handleApprove} disabled={reviewing}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
                {reviewing ? 'Processing...' : 'Approve & Issue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
