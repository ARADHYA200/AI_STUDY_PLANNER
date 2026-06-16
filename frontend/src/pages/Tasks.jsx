import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { taskService } from '../services/api.service';
import Button from '../components/ui/Button';
import TaskCard from '../components/tasks/TaskCard';
import NewTaskModal from '../components/tasks/NewTaskModal';
import Loader from '../components/ui/Loader';

export const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await taskService.getTasks();
            // Map Mongoose _id to task.id for compatability with existing TaskCard
            const mapped = res.data.data.map(t => ({ ...t, id: t._id }));
            setTasks(mapped);
        } catch (error) {
            toast.error(error.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (newTaskData) => {
        try {
            const payload = {
                title: newTaskData.title,
                description: newTaskData.description,
                priority: newTaskData.priority,
                subject: newTaskData.subject,
                deadline: newTaskData.deadline,
            };

            if (newTaskData.id) {
                await taskService.updateTask(newTaskData.id, {
                    ...payload,
                    status: newTaskData.status,
                });
                toast.success('Task updated successfully!');
            } else {
                await taskService.createTask(payload);
                toast.success('Task added successfully!');
            }
            fetchTasks();
        } catch (error) {
            toast.error(error.message || 'Failed to save task');
            throw error;
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const payload = {
                title: task.title,
                description: task.description,
                priority: task.priority,
                subject: task.subject,
                deadline: task.deadline,
                status: newStatus,
            };
            await taskService.updateTask(id, payload);
            toast.success(`Task status updated to ${newStatus}`);
            fetchTasks();
        } catch (error) {
            toast.error(error.message || 'Failed to update task status');
        }
    };

    const handleDelete = async (id) => {
        try {
            await taskService.deleteTask(id);
            toast.success('Task deleted successfully');
            fetchTasks();
        } catch (error) {
            toast.error(error.message || 'Failed to delete task');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setIsAddTaskModalOpen(true);
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'All') return true;
        return task.status === filter;
    });

    if (loading) return <Loader fullScreen />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">My Tasks</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your assignments and to-dos.</p>
                </div>

                <Button variant="primary" onClick={() => { setEditingTask(null); setIsAddTaskModalOpen(true); }}>
                    + Add New Task
                </Button>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2"
            >
                {['All', 'Pending', 'Completed'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </motion.div>

            {/* Task Grid */}
            {filteredTasks.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-dashed rounded-xl p-12 text-center text-gray-400">
                    <span className="text-4xl mb-4 block">✔️</span>
                    <p>No {filter.toLowerCase()} tasks found. You're all caught up!</p>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {filteredTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </motion.div>
            )}

            <NewTaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => { setIsAddTaskModalOpen(false); setEditingTask(null); }}
                onAddTask={handleAddTask}
                editTask={editingTask}
            />
        </div>
    );
};

export default Tasks;
