import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { scheduleService, aiService } from '../services/api.service';
import { useSubjects } from '../hooks/useSubjects';
import NewSubjectModal from '../components/subjects/NewSubjectModal';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';

export const ScheduleEditor = () => {
  const { subjects, fetchSubjects, createSubject } = useSubjects();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [savingSubjectIndex, setSavingSubjectIndex] = useState(null);

  const [subjectsInputs, setSubjectsInputs] = useState(['']);

  const [config, setConfig] = useState({
    selectedSubjects: [],
    hoursPerDay: 4,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleAddSubjectInput = () => {
    setSubjectsInputs([...subjectsInputs, '']);
  };

  const handleSaveSubjectToDb = async (index) => {
    const name = subjectsInputs[index]?.trim();
    if (!name) {
      toast.error('Enter a subject name before saving');
      return;
    }

    setSavingSubjectIndex(index);
    try {
      await createSubject({
        name,
        studyGoal: `Complete ${name} preparation`,
        targetDate: config.endDate,
        totalHours: Number(config.hoursPerDay) * 7 || 20,
      });
      toast.success(`"${name}" saved to your subjects`);
      await fetchSubjects();
    } catch (err) {
      toast.error(err.message || 'Failed to save subject');
    } finally {
      setSavingSubjectIndex(null);
    }
  };

  const handleUseSavedSubject = (subjectName) => {
    if (subjectsInputs.includes(subjectName)) {
      toast.info('Subject already added to planner inputs');
      return;
    }
    const emptyIndex = subjectsInputs.findIndex((s) => !s.trim());
    if (emptyIndex >= 0) {
      const updated = [...subjectsInputs];
      updated[emptyIndex] = subjectName;
      setSubjectsInputs(updated);
    } else {
      setSubjectsInputs([...subjectsInputs, subjectName]);
    }
  };

  const handleRemoveSubjectInput = (index) => {
    setSubjectsInputs(subjectsInputs.filter((_, i) => i !== index));
  };

  const handleSubjectInputChange = (index, value) => {
    const updated = [...subjectsInputs];
    updated[index] = value;
    setSubjectsInputs(updated);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [schedRes] = await Promise.all([
        scheduleService.getSchedules(),
        fetchSubjects(),
      ]);

      setSchedules(schedRes.data?.data?.schedules || []);
    } catch (err) {
      console.error(err);
      setError('Failed to sync study schedule. Please try again.');
      toast.error('Failed to sync schedule data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {

    const activeSubjects = subjectsInputs.filter(s => s.trim() !== "");
    if (activeSubjects.length === 0) {
      toast.error('Please input at least one subject to generate schedule');
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await aiService.generateStudyPlan({
        examDate: config.endDate,
        subjects: activeSubjects,
        hoursPerDay: Number(config.hoursPerDay),
        difficultyLevel: 'Medium',
      });
      toast.success('AI Plan generated and synchronized!');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'AI scheduling failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await scheduleService.completeSession(id, { performance: 9, mood: 'Great' });
      toast.success('Session locked! +50 XP');
      fetchData();
    } catch (err) {
      toast.error('Failed to update session');
    }
  };

  const daySchedules = (schedules || []).filter(
    (s) => s?.scheduledDate && new Date(s.scheduledDate).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Study <span className="text-gradient">Engine</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">
            Automate your focus time with AI precision
          </p>
        </div>
        <Button variant="secondary" onClick={fetchData} className="text-xs font-bold">
          🔄 Sync Calendar
        </Button>
      </section>

      {/* Main Schedule Input Form (Always Rendered) */}
      <section>
        <GlassCard className="p-8 border-brand-500/20 bg-brand-500/5" hover={false}>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">⚙️ AI Planner Architect</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Subject Inputs */}
            <div className="lg:col-span-1 space-y-4">
              <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Subjects *
              </label>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {subjectsInputs.map((subj, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`Subject ${index + 1}`}
                      value={subj}
                      onChange={(e) => handleSubjectInputChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 text-xs font-bold rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSubjectToDb(index)}
                      disabled={savingSubjectIndex === index}
                      className="px-3 py-2 text-brand-600 hover:bg-brand-500/10 rounded-xl text-xs font-bold border border-brand-500/20"
                      title="Save to database"
                    >
                      {savingSubjectIndex === index ? '...' : '💾'}
                    </button>
                    {subjectsInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubjectInput(index)}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-bold border-none"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full text-xs font-bold mt-2"
                onClick={handleAddSubjectInput}
              >
                + Add Subject Row
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full text-xs font-bold mt-2"
                onClick={() => setShowSubjectModal(true)}
              >
                + Add Subject to Vault
              </Button>

              {subjects.length > 0 && (
                <div className="pt-4 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject._id}
                        type="button"
                        onClick={() => handleUseSavedSubject(subject.name)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 hover:bg-brand-500/20"
                      >
                        {subject.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Config Fields */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <Input 
                label="Study Intensity (Hours/Day)" 
                type="number" 
                value={config.hoursPerDay}
                onChange={(e) => setConfig({ ...config, hoursPerDay: e.target.value })}
                min="1"
                max="12"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  type="date" 
                  label="From Date" 
                  value={config.startDate}
                  onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                />
                <Input 
                  type="date" 
                  label="To Date / Exam Date" 
                  value={config.endDate}
                  onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                />
              </div>
              <Button 
                className="md:col-span-2 w-full" 
                variant="primary" 
                onClick={handleGenerate}
                isLoading={isGenerating}
              >
                Sync AI Schedule ⚡
              </Button>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Loading state bar */}
      {loading && (
        <div className="flex items-center justify-center p-8 bg-white/40 dark:bg-slate-900/40 rounded-3xl backdrop-blur-sm">
          <Loader />
          <span className="ml-3 text-sm font-bold text-slate-500">Syncing database calendar...</span>
        </div>
      )}

      {/* Error State Banner */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="text-rose-500" onClick={fetchData}>Try Again 🔄</Button>
        </div>
      )}

      {/* Main Grid: Calendar and day flow */}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Calendar Side */}
          <div className="xl:col-span-1 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Timeline</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {selectedDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </span>
             </div>
             <GlassCard className="!p-0 overflow-hidden" hover={false}>
               <Calendar 
                 onChange={setSelectedDate} 
                 value={selectedDate} 
               />
             </GlassCard>
             
             <GlassCard className="p-6 bg-slate-900 text-white border-none">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🧩</div>
                  <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consistency</p>
                     <p className="text-lg font-black">
                       {Math.round(((schedules || []).filter(s => s?.isCompleted).length / Math.max((schedules || []).length, 1)) * 100)}% Completion
                     </p>
                  </div>
                </div>
             </GlassCard>
          </div>

          {/* Sessions Feed */}
          <div className="xl:col-span-2 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Day Flow <span className="text-slate-400 ml-2 font-medium">— {selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                </h3>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
             </div>

             <div className="space-y-4">
               {daySchedules.length > 0 ? daySchedules.map((session, index) => (
                 <motion.div
                   key={session._id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   className={`group p-6 rounded-[2.5rem] glass-morphism flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-none transition-all
                     ${session.isCompleted ? 'bg-green-500/5' : 'hover:bg-white dark:hover:bg-slate-800'}`}
                 >
                   <div className="flex items-center gap-6 flex-1">
                     <div className={`shrink-0 w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center font-black transition-all group-hover:scale-110
                       ${session.isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'}`}>
                       <span className="text-[10px] font-black uppercase opacity-60">Time</span>
                       <span className="text-sm">{session.startTime || "08:00"}</span>
                     </div>
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">{session.subjectId?.name || "Subject"}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.duration * 60}m PowerSession</span>
                       </div>
                       <h4 className={`text-xl font-black tracking-tight ${session.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                         {session.topicId?.name || 'Deep Work Session'}
                       </h4>
                     </div>
                   </div>

                   <div className="w-full md:w-auto">
                     {session.isCompleted ? (
                       <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-xl text-xs font-black uppercase">
                         <span>Locked In ✓</span>
                       </div>
                     ) : (
                       <Button variant="secondary" size="sm" className="w-full md:w-auto text-xs font-bold" onClick={() => handleComplete(session._id)}>
                         Complete Session
                       </Button>
                     )}
                   </div>
                 </motion.div>
               )) : (
                  <div className="p-20 glass-morphism rounded-[3rem] border-dashed text-center flex flex-col items-center">
                    <span className="text-6xl mb-6">🏜️</span>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Void Protocol Active</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">No sessions detected on this date</h3>
                  </div>
               )}
             </div>
          </div>
        </div>
      )}
      <NewSubjectModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onSuccess={fetchData}
        createSubject={createSubject}
      />
    </div>
  );
};

export default ScheduleEditor;
