import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { subjectService, scheduleService, progressService } from '../services/api.service';
import { useSubjects } from '../hooks/useSubjects';
import StatWidget from '../components/dashboard/StatWidget';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import NewSubjectModal from '../components/subjects/NewSubjectModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createSubject } = useSubjects();
  const [loading, setLoading] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [data, setData] = useState({
    subjects: [],
    schedules: [],
    stats: null,
    weeklyTrend: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [subs, scheds, stats, trend, streakRes] = await Promise.all([
        subjectService.getSubjects(),
        scheduleService.getSchedules(),
        progressService.getOverallStats(),
        progressService.getWeeklyTrend(),
        progressService.getStreak(),
      ]);

      const pendingSchedules = (scheds.data.data?.schedules || []).filter((s) => !s.isCompleted);

      setData({
        subjects: subs.data.data || [],
        schedules: pendingSchedules,
        stats: {
          ...(stats.data.data?.summary || {}),
          streak: streakRes.data.data?.currentStreak || 0,
          completionRate: stats.data.data?.summary?.averagePerformance
            ? Math.round((stats.data.data.summary.averagePerformance / 10) * 100)
            : 0,
        },
        weeklyTrend: trend.data.data?.trend?.map((t) => ({
          day: t.date.split('-').pop(),
          score: t.avgPerformance,
        })) || [],
      });
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Hello, <span className="text-gradient">{user?.name?.split(' ')[0]}!</span> 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            You're on a <span className="text-brand-600 dark:text-brand-400 font-bold">{data.stats?.streak || 0} day streak</span>. Keep it up!
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="glass"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => {
              window.print();
            }}
          >
            Export Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/schedule')}
          >
            + New Session
          </Button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget 
          title="Study Hours" 
          value={`${data.stats?.totalHours || 0}h`} 
          subtitle="This Month"
          icon="⏱️"
          trend={12}
          color="brand"
        />
        <StatWidget 
          title="Completion" 
          value={`${data.stats?.completionRate || 0}%`} 
          subtitle="Average"
          icon="🎯"
          trend={5}
          color="cyan"
        />
        <StatWidget 
          title="Subjects" 
          value={data.subjects.length} 
          subtitle="Active"
          icon="📚"
          color="orange"
        />
        <StatWidget 
          title="Next Goal" 
          value="Calculus" 
          subtitle="In 2 hours"
          icon="🔥"
          color="rose"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity Chart */}
        <GlassCard className="lg:col-span-2 p-8" hover={false}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Productivity Score</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Weekly Insight</p>
            </div>
            <select className="glass-input text-xs font-bold rounded-xl px-4 py-2">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#94A3B8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#94A3B8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Up Next List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Up Next</h3>
            <Button variant="ghost" size="sm" className="text-brand-600" onClick={() => navigate('/schedule')}>
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {data.schedules.length > 0 ? data.schedules.slice(0, 4).map((session, index) => (
              <motion.div
                key={session._id}
                variants={itemVariants}
                className="group flex items-center gap-4 p-4 glass-morphism rounded-[2rem] hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-900 dark:text-white group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                  <span className="text-[10px] font-black uppercase">{new Date(session.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-black">{new Date(session.scheduledDate).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{session.subject?.name || 'Study Session'}</h4>
                  <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{session.topic?.name || 'General Review'} • {session.duration}m</p>
                </div>
                <div className="hidden group-hover:block transition-all mr-2">
                  <span className="text-brand-600 dark:text-brand-400">→</span>
                </div>
              </motion.div>
            )) : (
              <GlassCard className="p-10 text-center flex flex-col items-center justify-center border-dashed">
                <span className="text-4xl mb-4">🧘</span>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Pure Peace</p>
                <p className="text-xs text-slate-400 mt-1">Nothing scheduled for today.</p>
              </GlassCard>
            )}
          </div>
        </section>
      </div>

      {/* Quick Subject Access */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Subjects</h3>
          <Button variant="ghost" size="sm" className="text-brand-600" onClick={() => setShowSubjectModal(true)}>
            + Add Subject
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.subjects.slice(0, 4).map((subject) => (
            <GlassCard key={subject._id} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-2xl">
                  {subject.name.charAt(0).match(/[A-Z]/) ? '📘' : '📔'}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
                  <p className="text-sm font-black text-brand-600 dark:text-brand-400">{Math.round((subject.hoursCompleted / subject.totalHours) * 100) || 0}%</p>
                </div>
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2">{subject.name}</h4>
              <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-6">{subject.description || 'No description provided.'}</p>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((subject.hoursCompleted / subject.totalHours) * 100, 100) || 0}%` }}
                  className="h-full bg-brand-500 rounded-full"
                />
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => navigate(`/subjects/${subject._id}`)}
              >
                Manage Subject
              </Button>
            </GlassCard>
          ))}
          {/* Add Subject Card */}
          <GlassCard
            className="p-6 border-dashed border-2 border-brand-500/20 flex flex-col items-center justify-center cursor-pointer group"
            hover={true}
            onClick={() => setShowSubjectModal(true)}
          >
            <div className="w-14 h-14 rounded-full bg-brand-500/5 group-hover:bg-brand-500/10 flex items-center justify-center mb-4 transition-colors">
              <span className="text-3xl text-brand-600 dark:text-brand-400 font-light">+</span>
            </div>
            <p className="text-sm font-black text-brand-600 dark:text-brand-400">Add New Subject</p>
          </GlassCard>
        </div>
      </section>

      <NewSubjectModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onSuccess={loadDashboardData}
        createSubject={createSubject}
      />
    </motion.div>
  );
};

export default Dashboard;
