import { useState, useEffect } from 'react';
import { DataStore, IssueBookDetail } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { FileText, Search, Calendar } from 'lucide-react';

export function Records() {
  const [records, setRecords]     = useState<IssueBookDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'returned'>('all');
  const { user, studentProfile }  = useAuth();

  useEffect(() => { //will do this later, matug sa ko
    const load = async () => {
      if (user?.usertype === 'Student') {
        //students only see their own records
        //use studentId from linked profile if available, otherwise fall back to userID
        const id = studentProfile?.userId ?? user.id;
        const mine = await DataStore.getIssuesByStudent(id);
        setRecords(mine);
      } else {
        //admin/librarian see everything
        setRecords(await DataStore.getIssues());
      }
    };
    load();
  }, [user, studentProfile]);

  const isStudent = user?.usertype === 'Student';

  let filtered = [...records];
  if (statusFilter !== 'all') filtered = filtered.filter((r) => r.status === statusFilter);
  if (searchTerm) {
    filtered = filtered.filter(
      (r) =>
        r.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (!isStudent && r.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-600 p-3 rounded-lg"><FileText className="w-6 h-6 text-white" /></div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {isStudent ? 'My Issue Records' : 'Issue Records'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isStudent ? 'Your personal book issue and return history' : 'View all book issue and return records'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text"
              placeholder={isStudent ? 'Search by book name...' : 'Search by book or student name...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Total Records</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{records.length}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-600 mb-1">Currently Issued</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{records.filter((r) => r.status === 'pending').length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">Returned</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{records.filter((r) => r.status === 'returned').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['ID', 'Book Name', ...(!isStudent ? ['Student Name'] : []), 'Issue Date', 'Due Date', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={isStudent ? 5 : 6} className="px-6 py-8 text-center text-gray-500">No records found</td></tr>
              ) : filtered.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{record.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{record.bookName}</td>
                  {!isStudent && <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{record.studentName}</td>}
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" />{record.issueDate}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" />{record.dueDate}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'}`}>
                      {record.status === 'pending' ? 'Issued' : 'Returned'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
