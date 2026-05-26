/**
 * Role: Student only
 * Read-only view of all books in the library.
 * Students can search, and submit a borrow request directly from here.
 */

import { useState, useEffect } from 'react';
import { DataStore, BookDetail } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { Library, Search, BookOpen, Send, CheckCircle, AlertCircle, X } from 'lucide-react';

//spacing for better readability ffs. dont forget to adjust dsb
export function BookCatalog() {
  const { user, studentProfile } = useAuth();
  const [books, setBooks]       = useState<BookDetail[]>([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  //borrow request modal
  const [requesting, setRequesting]         = useState<BookDetail | null>(null);
  const [preferredDueDate, setPreferredDueDate] = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [toast, setToast]                   = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    DataStore.getBooks().then((b) => { setBooks(b); setLoading(false); });
    //default preferred due date is 2 weeks from now, can be adjusted by lib or admin
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setPreferredDueDate(d.toISOString().split('T')[0]);
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  //added this late. Book req to lib or admin from stud.
  const handleRequest = async () => {
    if (!requesting || !user) return;
    setSubmitting(true);
    try {
      await DataStore.submitBorrowRequest({
        userId:      user.id,
        studentName: studentProfile?.studentName ?? user.username,
        bookId:      requesting.bookId,
        bookName:    requesting.bookName,
        preferredDueDate: preferredDueDate || undefined,
      });
      showToast(`Borrow request for "${requesting.bookName}" submitted!`);
      setRequesting(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit request', false);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = books.filter(
    (b) =>
      b.bookName.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  const available = books.filter((b) => b.quantity > 0).length;

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
        <div className="bg-teal-600 p-3 rounded-lg">
          <Library className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Book Catalog</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Browse all books — request one to borrow</p>
        </div>
      </div>

      {/* summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
          <p className="text-sm text-teal-600 dark:text-teal-400 mb-1">Total Titles</p>
          <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">{books.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Available Now</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300">{available}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Out of Stock</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-300">{books.length - available}</p>
        </div>
      </div>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
            focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* book grid for clean look */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No books found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((book) => (
            <div key={book.bookId}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="bg-teal-100 dark:bg-teal-900/40 p-2.5 rounded-lg shrink-0">
                  <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-snug">{book.bookName}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">by {book.author}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                  ${book.quantity === 0
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : book.quantity <= 2
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                  {book.quantity === 0 ? 'Out of Stock' : `${book.quantity} available`}
                </span>
              </div>

              <button
                onClick={() => setRequesting(book)}
                disabled={book.quantity === 0}
                className="mt-auto w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors
                  bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" />
                {book.quantity === 0 ? 'Unavailable' : 'Request to Borrow'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* borrow request modal */}
      {requesting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white">Request to Borrow</h3>
              <button onClick={() => setRequesting(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-800 dark:text-white">{requesting.bookName}</p>
              <p className="text-gray-500 dark:text-gray-400">by {requesting.author}</p>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{requesting.quantity} cop{requesting.quantity === 1 ? 'y' : 'ies'} available</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Preferred Return Date <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={preferredDueDate}
                onChange={(e) => setPreferredDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                  focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                The librarian will confirm the actual due date when approving.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setRequesting(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleRequest} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
