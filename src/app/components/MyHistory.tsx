import { useState, useEffect } from 'react';
import { DataStore, IssueBookDetail } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { History, Search, Calendar, BookOpen } from 'lucide-react';

export function MyHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState<IssueBookDetail[]>([]);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<'all' | 'pending' | 'returned'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      //query by user account ID
      const all = await DataStore.getIssuesByUser(user.id);
      setRecords(all);
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = records.filter((r) => {
    const matchSearch = r.bookName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || r.status === filter;
    return matchSearch && matchStatus;
  });

  const totalBorrowed = records.length;
  const totalReturned = records.filter((r) => r.status === 'returned').length;
  const totalPending  = records.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex items-center gap-3">
        <div className="bg-purple-600 p-3 rounded-lg">
          <History className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">My Borrowing History</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">All books you have ever borrowed</p>
        </div>
      </div>

      {/* summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Borrowed</p>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{totalBorrowed}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Returned</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{totalReturned}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Still Borrowed</p>
          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{totalPending}</p>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by book name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
              focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'returned'] as const).map((f) => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                ${filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {f === 'pending' ? 'Borrowed' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  {['#', 'Book Name', 'Issue Date', 'Due Date', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-white">{r.bookName}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{r.issueDate}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{r.dueDate}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${r.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                        {r.status === 'pending' ? 'Borrowed' : 'Returned'}
                      </span>
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
