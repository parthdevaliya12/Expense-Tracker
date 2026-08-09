import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
    toast.success(`Theme changed to ${e.target.value}`);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setIsUpdatingProfile(true);
      await updateProfile(name);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords don't match");
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setIsUpdatingPassword(true);
      await updatePassword(currentPassword, newPassword);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="glass-panel rounded-3xl shadow-sm border border-border overflow-hidden">
        {/* Profile Section */}
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Profile Information</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email (cannot be changed)</label>
              <input
                type="text"
                value={user?.email || ''}
                disabled
                className="w-full sm:w-64 px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isUpdatingProfile || name === user?.name}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingProfile ? <Loader2 size={18} className="animate-spin" /> : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Appearance (Theme)</label>
              <select 
                value={theme}
                onChange={handleThemeChange}
                className="w-full sm:w-64 px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System (Auto)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                Choose how the application looks to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
