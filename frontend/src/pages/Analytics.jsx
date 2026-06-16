import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { progressService } from '../services/api.service';
import StatWidget from '../components/dashboard/StatWidget';
import GlassCard from '../components/ui/GlassCard';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];

export const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: null,
    trend: [],
    history: [],
    subjectDistribution: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendRes] = await Promise.all([
        progressService.getOverallStats(),
        progressService.getWeeklyTrend(),
      ]);

      const summary = statsRes.data.data.summary;
      const trend = trendRes.data.data.trend;
      
      // Map trend for chart
      const chartTrend = trend.map(t => ({
        date: t.date.split('-').slice(1).join('/'),
        performance: t.avgPerformance,
        sessions: t.sessionsCount
      }));

      // Distribution fake data or calculated from history if available
      const distribution = statsRes.data.data.dailyData[0]?.subjects.map((s, i) => ({
        name: s.name,
        value: s.hours
      })) || [
        { name: 'Physics', value: 40 },
        { name: 'Math', value: 30 },
        { name: 'Bio', value: 20 },
        { name: 'Others', value: 10 },
      ];

      setData({
        stats: summary,
        trend: chartTrend,
        subjectDistribution: distribution,
      });
    } catch (error) {
      console.error('Analytics load error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Performance <span className="text-gradient">Core</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">
            AI-driven insights into your academic efficiency
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => window.print()}>Download PDF</Button>
          <Button variant="primary" onClick={() => navigate('/ai-assistant')}>✨ Optimize Routine</Button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget 
          title="Total Hours" 
          value={`${data.stats?.totalHours || 0}h`} 
          subtitle="All Time"
          icon="📚"
          color="brand"
        />
        <StatWidget 
          title="Avg Session" 
          value={`${data.stats?.averageSessionDuration || 0}h`} 
          subtitle="Duration"
          icon="⏱️"
          color="cyan"
        />
        <StatWidget 
          title="Performance" 
          value={`${data.stats?.averagePerformance?.toFixed(1) || 0}/10`} 
          subtitle="Score"
          icon="🎯"
          color="rose"
        />
        <StatWidget 
          title="Sessions" 
          value={data.stats?.totalSessions || 0} 
          subtitle="Completed"
          icon="🔥"
          color="orange"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Progress Curve */}
        <GlassCard className="p-8" hover={false}>
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Growth Velocity</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Performance Trend (30 Days)</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
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
                  dataKey="performance" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorPerf)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Focus Distribution */}
        <GlassCard className="p-8" hover={false}>
          <div className="mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Topic Saturation</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Study Hours by Subject</p>
          </div>
          <div className="h-[350px] w-full flex flex-col md:flex-row items-center">
            <div className="flex-1 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.subjectDistribution}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {data.subjectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-48 space-y-3 mt-6 md:mt-0">
              {data.subjectDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{entry.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Mood vs Productivity */}
      <GlassCard className="p-8" hover={false}>
        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Emotional Context</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Mood correlation with study performance</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.entries(data.stats?.moodDistribution || {}).map(([mood, count]) => ({ mood, count }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="mood" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94A3B8' }} />
              <Bar dataKey="count" fill="#06b6d4" radius={[12, 12, 0, 0]} barSize={40} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '20px', border: 'none' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};

export default Analytics;
