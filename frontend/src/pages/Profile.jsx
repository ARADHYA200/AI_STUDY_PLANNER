import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeProvider';
import { authService } from '../services/api.service';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { STUDY_GOALS, STUDY_LEVELS } from '../utils/constants';

export const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    dailyGoalHours: user?.preferences?.dailyGoalHours || 2,
    studyGoal: user?.studyGoal || 'Exam Preparation',
    studyLevel: user?.studyLevel || 'Intermediate',
    notificationsEnabled: user?.preferences?.notificationsEnabled ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGoalSelect = (goal) => {
    setFormData((prev) => ({ ...prev, studyGoal: goal }));
  };

  const handleLevelSelect = (level) => {
    setFormData((prev) => ({ ...prev, studyLevel: level }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        theme, // Sync current theme mode
        dailyGoalHours: Number(formData.dailyGoalHours),
        notificationsEnabled: formData.notificationsEnabled,
        studyGoal: formData.studyGoal,
        studyLevel: formData.studyLevel,
      };

      const res = await authService.updatePreferences(payload);
      
      // The backend returns updated user. Map it back.
      const freshUser = res.data.data;
      updateUser(freshUser);
      
      toast.success('Profile preferences locked in!');
    } catch (error) {
      toast.error(error.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Student <span className="text-gradient">Profile</span> 👤
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">
          Fine-tune study configurations and goal settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="text-center p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-4xl font-black shadow-lg shadow-brand-500/10 mb-4">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user?.name}</h2>
            <p className="text-sm font-bold text-slate-400 mt-1">{user?.email}</p>
            <div className="mt-4 px-4 py-1.5 bg-brand-600 text-white rounded-full text-xs font-black uppercase tracking-wider">
              {formData.studyLevel}
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-800/80 my-6"></div>

            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-400">Current Theme</span>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-xs font-bold capitalize text-slate-700 dark:text-slate-300"
                >
                  {theme} Mode 🌓
                </button>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-400">Target Hours</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{formData.dailyGoalHours} hrs/day</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full mt-8 border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white" onClick={logout}>
              Sign Out 🚪
            </Button>
          </GlassCard>
        </div>

        {/* Preference Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8">
            <form onSubmit={handleSave} className="space-y-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                Academic Preferences
              </h3>

              {/* Study Goal Choice */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Study Goal</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STUDY_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleGoalSelect(goal)}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border
                        ${
                          formData.studyGoal === goal
                            ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                            : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Level Choice */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">Skill Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {STUDY_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleLevelSelect(level)}
                      className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border
                        ${
                          formData.studyLevel === level
                            ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                            : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Daily Goal (Hours)"
                  type="number"
                  name="dailyGoalHours"
                  value={formData.dailyGoalHours}
                  onChange={handleChange}
                  min="0.5"
                  max="12"
                  step="0.5"
                  required
                />
                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="notificationsEnabled"
                      checked={formData.notificationsEnabled}
                      onChange={handleChange}
                      className="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Enable Notification Reminders
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button type="submit" variant="primary" isLoading={saving}>
                  Save Changes 💾
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
