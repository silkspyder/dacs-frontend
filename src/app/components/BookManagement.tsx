import { useState, useEffect } from 'react';
import { DataStore, BookDetail } from '../data/mockData';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export function BookManagement() {
  const [books, setBooks] = useState<BookDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookDetail | null>(null);
  const [formData, setFormData] = useState({ bookName: '', author: '', quantity: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    try {
      setBooks(await DataStore.getBooks());
    } catch { setError('Failed to load books'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBook) {
        await DataStore.updateBook(editingBook.bookId, formData);
      } else {
        await DataStore.addBook(formData);
      }
      resetForm();
      await loadBooks();
    } catch { setError('Failed to save book'); }
    finally { setLoading(false); }
  };

  const handleEdit = (book: BookDetail) => {
    setEditingBook(book);
    setFormData({ bookName: book.bookName, author: book.author, quantity: book.quantity });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await DataStore.deleteBook(id);
      await loadBooks();
    } catch { setError('Failed to delete book'); }
  };

  const resetForm = () => {
    setFormData({ bookName: '', author: '', quantity: 0 });
    setEditingBook(null);
    setShowForm(false);
  };

  const filteredBooks = books.filter(
    (book) =>
      book.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Book
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {editingBook ? 'Edit Book' : 'Add New Book'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Book Name</label>
                <input type="text" required value={formData.bookName}
                  onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Author</label>
                <input type="text" required value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                <input type="number" required min="0" value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-colors">
                {loading ? 'Saving...' : (editingBook ? 'Update' : 'Add')} Book
              </button>
              <button type="button" onClick={resetForm}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['ID', 'Book Name', 'Author', 'Quantity', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBooks.map((book) => (
                <tr key={book.bookId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{book.bookId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{book.bookName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{book.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      book.quantity > 5 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : book.quantity > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                      {book.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(book)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(book.bookId)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
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
