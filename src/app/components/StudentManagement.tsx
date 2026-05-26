import { useState, useEffect } from 'react';
import { DataStore, StudentDetail, User } from '../data/mockData';
import { Plus, Edit2, Trash2, Search, Link, UserCheck } from 'lucide-react';
import { api } from '../api/apiClient';

export function StudentManagement() {
  const [students, setStudents]           = useState<StudentDetail[]>([]);
  const [unlinkedUsers, setUnlinkedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [showForm, setShowForm]           = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentDetail | null>(null);
  const [formData, setFormData]           = useState({ studentName: '', course: '', branch: '', userId: '' });
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [s, u] = await Promise.all([
        DataStore.getStudents(),
        api.get<User[]>('/users'),
      ]);
      setStudents(s);
      //users with student role that don't yet have a student profile linked
      const linkedIds = new Set(s.map((st) => st.userId).filter(Boolean));
      setUnlinkedUsers(u.filter((usr) => usr.usertype === 'Student' && !linkedIds.has(usr.id)));
    } catch {
      setError('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        studentName: formData.studentName,
        course: formData.course,
        branch: formData.branch,
        userId: formData.userId ? parseInt(formData.userId) : undefined,
      };
      if (editingStudent) {
        await DataStore.updateStudent(editingStudent.studentId, payload);
      } else {
        await DataStore.addStudent(payload);
      }
      resetForm();
      await loadAll();
    } catch {
      setError('Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: StudentDetail) => {
    setEditingStudent(student);
    setFormData({
      studentName: student.studentName,
      course:      student.course,
      branch:      student.branch,
      userId:      student.userId ? String(student.userId) : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this student profile?')) return;
    try {
      await DataStore.deleteStudent(id);
      await loadAll();
    } catch {
      setError('Failed to delete student');
    }
  };

  const resetForm = () => {
    setFormData({ studentName: '', course: '', branch: '', userId: '' });
    setEditingStudent(null);
    setShowForm(false);
  };

  const filtered = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.username ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search students..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />Add Student
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {editingStudent ? 'Edit Student Profile' : 'Add Student Profile'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Name</label>
                <input type="text" required value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course</label>
                <input type="text" required value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                <input type="text" required value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link to User Account <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">— No linked account —</option>
                  {/* Show currently linked user if editing */}
                  {editingStudent?.userId && editingStudent.username && (
                    <option value={editingStudent.userId}>{editingStudent.username} (current)</option>
                  )}
                  {unlinkedUsers
                    .filter((u) => !editingStudent?.userId || u.id !== editingStudent.userId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>{u.username} — {u.email}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Linking allows this student to log in and see their own borrowed books.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-colors">
                {loading ? 'Saving...' : (editingStudent ? 'Update' : 'Add')} Student
              </button>
              <button type="button" onClick={resetForm}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg transition-colors">
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
                {['ID', 'Student Name', 'Course', 'Branch', 'Linked Account', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No students found</td></tr>
              ) : filtered.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{student.studentId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{student.studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{student.course}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{student.branch}</td>
                  <td className="px-6 py-4 text-sm">
                    {student.username ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        <UserCheck className="w-3.5 h-3.5" />{student.username}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500">
                        <Link className="w-3.5 h-3.5" />Not linked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(student)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(student.studentId)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
