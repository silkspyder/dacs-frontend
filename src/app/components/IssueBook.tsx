import { useState, useEffect } from 'react';
import { DataStore, BookDetail, StudentDetail } from '../data/mockData';
import { BookPlus, AlertCircle } from 'lucide-react';

export function IssueBook() {
  const [books, setBooks]               = useState<BookDetail[]>([]);
  const [students, setStudents]         = useState<StudentDetail[]>([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [issueDate, setIssueDate]       = useState('');
  const [dueDate, setDueDate]           = useState('');
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [b, s] = await Promise.all([
        DataStore.getBooks(),
        DataStore.getStudents(),
      ]);
      setBooks(b);
      //only show student profiles that are linked to a user account
      setStudents(s.filter((st) => st.userId != null));
    };
    loadData();

    const today = new Date().toISOString().split('T')[0];
    setIssueDate(today);
    const due = new Date();
    due.setDate(due.getDate() + 14);
    setDueDate(due.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const book    = books.find((b) => b.bookId === parseInt(selectedBook));
    const student = students.find((s) => s.studentId === parseInt(selectedStudent));

    if (!book || !student) { setError('Please select both a book and a student'); return; }
    if (book.quantity <= 0) { setError('This book is currently out of stock'); return; }

    setLoading(true);
    try { //dont change, just dont
      await DataStore.addIssue({
        bookId:      book.bookId,
        bookName:    book.bookName,
        studentId:   student.userId!,       // use the user's id so filtering works in MyBooks/Records
        studentName: student.studentName,
        issueDate,
        dueDate,
        status: 'pending',
      });
      setSuccess(`Successfully issued "${book.bookName}" to ${student.studentName}`);
      setSelectedBook('');
      setSelectedStudent('');
      setBooks(await DataStore.getBooks());
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 p-3 rounded-lg"><BookPlus className="w-6 h-6 text-white" /></div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Issue Book</h2>
            <p className="text-gray-600 dark:text-gray-400">Issue a book to a registered student</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />{error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-600 px-4 py-3 rounded-lg">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Book</label>
            <select required value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Choose a book...</option>
              {books.map((book) => (
                <option key={book.bookId} value={book.bookId}>
                  {book.bookName} by {book.author} (Available: {book.quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Student</label>
            <select required value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Choose a student...</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName} — {s.course || 'No course'} ({s.branch || 'No branch'})
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="text-xs text-orange-500 mt-1">
                No linked students found. Register students via User Management with the Student role.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Date</label>
              <input type="date" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
              <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-lg font-medium transition-colors">
            {loading ? 'Issuing...' : 'Issue Book'}
          </button>
        </form>
      </div>
    </div>
  );
}
