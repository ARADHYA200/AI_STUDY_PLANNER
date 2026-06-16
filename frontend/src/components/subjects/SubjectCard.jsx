import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  const progress = Math.round((subject.hoursCompleted / subject.totalHours) * 100) || 0;
  
  return (
    <GlassCard className="p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl 
          ${subject.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-600' : 
            subject.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-600' : 
            'bg-green-500/10 text-green-600'}`}>
          {subject.difficulty === 'Hard' ? '🔥' : subject.difficulty === 'Medium' ? '⚡' : '🌱'}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
          <p className="text-sm font-black text-brand-600 dark:text-brand-400">{progress}%</p>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 hover:text-brand-600 transition-colors cursor-pointer"
            onClick={() => navigate(`/subjects/${subject._id}`)}>
          {subject.name}
        </h3>
        <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-6">
          {subject.description || 'No description provided.'}
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm">
            <span className="text-slate-400">Progress</span>
            <span className="text-slate-900 dark:text-white">{subject.hoursCompleted} / {subject.totalHours} hrs</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              className={`h-full rounded-full ${progress > 80 ? 'bg-green-500' : 'bg-brand-500'}`}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1 text-xs font-bold py-2"
            onClick={() => navigate(`/subjects/${subject._id}`)}
          >
            Details
          </Button>
          <Button 
            variant="glass" 
            size="sm" 
            className="text-xs font-bold py-2 border-none"
            onClick={() => navigate('/ai-assistant')}
          >
            AI Insight
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default SubjectCard;
