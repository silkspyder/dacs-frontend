import { useState, useEffect } from 'react';
import { DataStore, IssueBookDetail } from '../data/mockData';
import { BookMinus, AlertCircle, CheckCircle } from 'lucide-react';

export function ReturnBook() {
  const [pendingIssues, setPendingIssues] = useState<IssueBookDetail[]>([]);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPendingIssues(); }, []);

  const loadPendingIssues = async () => {
    setPendingIssues(await DataStore.getPendingIssues());
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    const issue = pendingIssues.find((i) => i.id === parseInt(selectedIssue));
    if (!issue) return;

    setLoading(true);
    try {
      await DataStore.returnBook(issue.id);
      setSuccess(`Successfully returned "${issue.bookName}" from ${issue.studentName}`);
      setSelectedIssue('');
      await loadPendingIssues();
      setTimeout(() => setSuccess(''), 3000);
    } catch { } finally { setLoading(false); }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-600 p-3 rounded-lg"><BookMinus className="w-6 h-6 text-white" /></div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Return Book</h2>
            <p className="text-gray-600 dark:text-gray-400">Process book returns</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />{success}
          </div>
        )}

        <form onSubmit={handleReturn} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Book to Return</label>
            <select required value={selectedIssue} onChange={(e) => setSelectedIssue(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Choose a book to return...</option>
              {pendingIssues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  {issue.bookName} - {issue.studentName} (Due: {issue.dueDate})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-medium transition-colors">
            {loading ? 'Processing...' : 'Return Book'}
          </button>
        </form>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Currently Issued Books ({pendingIssues.length})
          </h3>
          {pendingIssues.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No books currently issued</p>
          ) : (
            <div className="space-y-3">
              {pendingIssues.map((issue) => (
                <div key={issue.id} className={`p-4 rounded-lg border ${
                  isOverdue(issue.dueDate)
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{issue.bookName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Student: {issue.studentName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Issued: {issue.issueDate} | Due: {issue.dueDate}</p>
                    </div>
                    {isOverdue(issue.dueDate) && (
                      <div className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />Overdue
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
