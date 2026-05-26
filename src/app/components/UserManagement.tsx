/**
 * UserManagement.tsx
 * Admin-only panel for creating, editing, and deleting users.
 */

import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Pencil, Trash2, X, Save, Search,
  CheckCircle, AlertCircle, ShieldCheck, BookOpen, GraduationCap, User,
} from 'lucide-react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

type UserType = 'Admin' | 'Librarian' | 'Student';

interface AppUser {
  id: number;
  username: string;
  email: string;
  contact: string;
  usertype: UserType;
}

interface UserFormData {
  username: string;
  email: string;
  contact: string;
  usertype: UserType;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: UserFormData = {
  username: '',
  email: '',
  contact: '',
  usertype: 'Student',
  password: '',
  confirmPassword: '',
};

const ROLE_META: Record<UserType, { label: string; icon: typeof User; color: string; bg: string }> = {
  Admin:     { label: 'Admin',     icon: ShieldCheck,    color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  Librarian: { label: 'Librarian', icon: BookOpen,       color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  Student:   { label: 'Student',   icon: GraduationCap,  color: 'text-green-600  dark:text-green-400',  bg: 'bg-green-100  dark:bg-green-900/30'  },
};

export function UserManagement() {
  const { user: currentUser } = useAuth();

  const [users, setUsers]       = useState<AppUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState<UserType | 'All'>('All');

  //modal state
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<AppUser | null>(null);
  const [form, setForm]         = useState<UserFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving]     = useState(false);

  //delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  //toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get<AppUser[]>('/users');
      setUsers(data);
    } catch {
      showToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || u.usertype === filterRole;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalMode('add');
  };

  const openEdit = (u: AppUser) => {
    setEditTarget(u);
    setForm({ username: u.username, email: u.email, contact: u.contact, usertype: u.usertype, password: '', confirmPassword: '' });
    setFormError('');
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  const handleSave = async () => {
    setFormError('');

    if (!form.username.trim() || !form.email.trim() || !form.contact.trim()) {
      setFormError('Username, email, and contact are required.');
      return;
    }
    if (modalMode === 'add' && !form.password) {
      setFormError('Password is required for new users.');
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        await api.post('/auth/register', {
          username:  form.username,
          email:     form.email,
          contact:   form.contact,
          usertype:  form.usertype,
          password:  form.password,
        });
        showToast(`User "${form.username}" created successfully.`, 'success');
      } else if (editTarget) {
        const payload: Record<string, string> = {
          email:    form.email,
          contact:  form.contact,
          usertype: form.usertype,
        };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editTarget.id}`, payload);
        showToast(`User "${editTarget.username}" updated successfully.`, 'success');
      }
      closeModal();
      loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      showToast(`User "${deleteTarget.username}" deleted.`, 'success');
      setDeleteTarget(null);
      loadUsers();
    } catch {
      showToast('Delete failed. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <AlertCircle  className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-3 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">User Management</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage all system users and roles</p>
          </div>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['All', 'Admin', 'Librarian', 'Student'] as const).map((r) => (
            <button key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${filterRole === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  {['#', 'Username', 'Email', 'Contact', 'Role', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const meta = ROLE_META[u.usertype] ?? ROLE_META.Student;
                  const RoleIcon = meta.icon;
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-800 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          {u.username}
                          {isSelf && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">you</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{u.email}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{u.contact}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
                          <RoleIcon className="w-3.5 h-3.5" />{u.usertype}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            title="Edit user">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={isSelf}
                            title={isSelf ? "You can't delete your own account" : "Delete user"}
                            className={`p-1.5 rounded-lg transition-colors
                              ${isSelf
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* add/edit modal */}
      {modalMode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-5">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {modalMode === 'add' ? 'Add New User' : `Edit — ${editTarget?.username}`}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* username: read-only in edit mode */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={modalMode === 'edit'}
                  placeholder="e.g. jdelacruz"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {modalMode === 'edit' && (
                  <p className="text-xs text-gray-400 mt-1">Usernames cannot be changed after creation.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@library.com"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contact</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="09XXXXXXXXX"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
                <select
                  value={form.usertype}
                  onChange={(e) => setForm({ ...form, usertype: e.target.value as UserType })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Admin">Admin</option>
                  <option value="Librarian">Librarian</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {modalMode === 'add' ? 'Password' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={modalMode === 'edit' ? 'Leave blank to keep current' : 'Required'}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                    bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : (modalMode === 'add' ? 'Create User' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Delete User</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{deleteTarget.username}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
