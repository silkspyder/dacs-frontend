import { useState, useEffect } from 'react';
import { DataStore, IssueBookDetail } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { BookMarked, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

function getDaysInfo(dueDate: string): { overdue: boolean; days: number } {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0
    ? { overdue: true,  days: Math.abs(diff) }
    : { overdue: false, days: diff };
}

export function MyBooks() {
  const { user } = useAuth();
  const [issues, setIssues]   = useState<IssueBookDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      //query by user account ID so search is reliable even if student's display name =! username
      const all = await DataStore.getIssuesByUser(user.id);
      setIssues(all.filter((i) => i.status === 'pending'));
      setLoading(false);
    };
    load();
  }, [user]);

  const overdue = issues.filter((i) => getDaysInfo(i.dueDate).overdue);
  const onTime  = issues.filter((i) => !getDaysInfo(i.dueDate).overdue);

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-3 rounded-lg">
          <BookMarked className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">My Books</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Books you currently have borrowed</p>
        </div>
      </div>

      {/* summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Currently Borrowed</p>
          <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{issues.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">On Time</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{onTime.length}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Overdue</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-300">{overdue.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : issues.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">You have no books currently borrowed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map((issue) => {
            const { overdue, days } = getDaysInfo(issue.dueDate);
            const fine = overdue ? days * 5 : 0;
            return (
              <div key={issue.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border p-5 shadow-sm
                  ${overdue
                    ? 'border-red-200 dark:border-red-800'
                    : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2.5 rounded-lg shrink-0">
                    <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  {overdue ? (
                    <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      <AlertCircle className="w-3 h-3" /> Overdue
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      <CheckCircle className="w-3 h-3" /> On Time
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{issue.bookName}</h3>

                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Issued: {issue.issueDate}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Due: {issue.dueDate}
                  </div>
                  <div className={`flex items-center gap-1.5 font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {overdue
                      ? `${days} day${days > 1 ? 's' : ''} overdue — Fine: ₱${fine}`
                      : days === 0 ? 'Due today!' : `${days} day${days > 1 ? 's' : ''} remaining`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
