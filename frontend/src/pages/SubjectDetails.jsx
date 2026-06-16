import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { subjectService, aiService } from '../services/api.service';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';

export const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [newTopic, setNewTopic] = useState({ name: '', estimatedHours: 2 });
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);

  useEffect(() => {
    fetchSubject();
  }, [id]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const res = await subjectService.getSubject(id);
      setSubject(res.data.data);
    } catch (error) {
      toast.error('Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.name) return toast.error('Topic name is required');
    
    try {
      await subjectService.addTopic(id, {
        name: newTopic.name,
        estimatedHours: Number(newTopic.estimatedHours) || 2,
      });
      toast.success('Topic added!');
      setNewTopic({ name: '', estimatedHours: 2 });
      fetchSubject();
    } catch (error) {
      toast.error('Failed to add topic');
    }
  };

  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    try {
      const res = await aiService.suggestTopics(subject.name);
      const suggestedTopics = res.data.data;
      
      // Batch add suggested topics
      await Promise.all(suggestedTopics.map(topic =>
        subjectService.addTopic(id, {
          name: topic.name,
          estimatedHours: topic.hours || 2,
        })
      ));
      
      toast.success('AI suggested and added new topics!');
      fetchSubject();
    } catch (error) {
      toast.error('AI suggestion failed');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const progress = Math.round((subject.hoursCompleted / subject.totalHours) * 100) || 0;

  return (
    <div className="space-y-10">
      {/* Header section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-0">
            ← Back to Fleet
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center text-3xl">
              📚
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {subject.name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">
                {subject.difficulty} • Exam: {new Date(subject.examDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/schedule')}>Planner</Button>
          <Button variant="primary" onClick={handleAiSuggest} isLoading={isAiSuggesting}>
            ✨ AI Breakdown
          </Button>
          <Button
            variant="secondary"
            className="border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
            onClick={async () => {
              if (!window.confirm(`Delete "${subject.name}"? This cannot be undone.`)) return;
              try {
                await subjectService.deleteSubject(id);
                toast.success('Subject deleted');
                navigate('/dashboard');
              } catch (error) {
                toast.error(error.message || 'Failed to delete subject');
              }
            }}
          >
            Delete
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Topics List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Curriculum Breakdown</h2>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{subject.topics?.length || 0} Modules</span>
          </div>

          <div className="space-y-4">
            {subject.topics?.length > 0 ? subject.topics.map((topic, index) => (
              <motion.div
                key={topic._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group glass-morphism p-6 rounded-[2.5rem] flex items-center gap-6 hover:bg-white dark:hover:bg-slate-800 transition-all border-none"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg 
                  ${topic.status === 'Completed' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {topic.status === 'Completed' ? '✓' : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{topic.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{topic.estimatedHours} Hours Required • {topic.difficulty}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-brand-600 dark:text-brand-400 mb-2">{topic.status}</p>
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: topic.status === 'Completed' ? '100%' : '20%' }} />
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="p-20 glass-morphism rounded-[3rem] border-dashed text-center flex flex-col items-center">
                <span className="text-6xl mb-6">🏝️</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empty Horizon</h3>
                <p className="text-slate-500 mt-2">No topics found. Start by adding one manually or use AI suggest.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar Actions */}
        <div className="space-y-8">
          {/* Progress Card */}
          <GlassCard className="p-8 bg-brand-600 text-white border-none shadow-2xl shadow-brand-600/30">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-80 mb-6">Mastery Level</h3>
            <div className="relative w-40 h-40 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="opacity-20"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * progress) / 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">{progress}%</span>
                <span className="text-[10px] font-bold uppercase opacity-80">Ready</span>
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between text-xs font-bold">
                 <span className="opacity-80">Hours Done</span>
                 <span>{subject.hoursCompleted}h</span>
               </div>
               <div className="flex justify-between text-xs font-bold">
                 <span className="opacity-80">Target</span>
                 <span>{subject.totalHours}h</span>
               </div>
            </div>
          </GlassCard>

          {/* Quick Add Topic */}
          <GlassCard className="p-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Add Topic</h3>
            <form onSubmit={handleAddTopic} className="space-y-4">
              <Input
                label="Topic Name"
                placeholder="e.g. Thermodynamics"
                value={newTopic.name}
                onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
              />
              <Input
                type="number"
                label="Est. Hours"
                value={newTopic.estimatedHours}
                onChange={(e) => setNewTopic({ ...newTopic, estimatedHours: e.target.value })}
              />
              <Button variant="primary" className="w-full mt-2" type="submit">
                Quick Add
              </Button>
            </form>
          </GlassCard>
          
          {/* Metadata */}
          <div className="px-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Created</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{new Date(subject.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Priority</span>
              <span className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded-lg text-[10px] font-black uppercase">Level {subject.priority}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetails;
