import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Mail, Phone, Shield, Save, CheckCircle } from 'lucide-react';

export function AccountManagement() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    contact: user?.contact || '',
    password: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  //finally finished this part w/o bugs, do not change it
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const updates: any = {
      username: formData.username,
      email: formData.email,
      contact: formData.contact,
    };
    if (formData.password) updates.password = formData.password;

    setLoading(true);
    try {
      await updateProfile(updates);
      setSuccess(true);
      setFormData({ ...formData, password: '', confirmPassword: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return ( //cleaned up + shortcuts for better debugging
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 p-3 rounded-lg"><UserCircle className="w-6 h-6 text-white" /></div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Account Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Update your account information</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />Profile updated successfully
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-medium">{user?.username.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{user?.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-indigo-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.usertype}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" required value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" required value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Change Password</h3>
            <div className="space-y-4">
              <input type="password" value={formData.password} placeholder="Leave blank to keep current password"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input type="password" value={formData.confirmPassword} placeholder="Confirm new password"
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-lg font-medium transition-colors">
            <Save className="w-5 h-5" />{loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
