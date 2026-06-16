import { motion } from "framer-motion";
import Badge from "../ui/Badge";

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, boxShadow: "0px 10px 20px rgba(0,0,0,0.05)" }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-5 border transition-colors group ${
        task.status === "Completed" 
          ? "border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-900/10" 
          : "border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-800"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className={`font-bold text-lg ${task.status === "Completed" ? "text-gray-400 line-through" : "text-gray-900 dark:text-gray-100"}`}>
          {task.title}
        </h3>
        <Badge variant={task.priority} />
      </div>
      
      <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
        {task.description}
      </p>

      {/* Tags Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium mb-4">
        <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md">
          {task.subject}
        </span>
        <span className={`flex items-center gap-1 ${new Date(task.deadline) < new Date() && task.status !== "Completed" ? "text-red-500 font-bold" : "text-gray-400"}`}>
          📅 {new Date(task.deadline).toLocaleDateString()}
        </span>
      </div>
      
      {/* Actions Row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <label className="flex items-center gap-2 cursor-pointer group-hover:text-indigo-600 transition-colors">
          <input
            type="checkbox"
            checked={task.status === "Completed"}
            onChange={(e) => onStatusChange(task.id, e.target.checked ? "Completed" : "Pending")}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-transform hover:scale-110 cursor-pointer"
          />
          <span className="text-sm">Done</span>
        </label>

        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(task)} 
            className="text-gray-400 hover:text-indigo-500 transition-colors"
            title="Edit Task"
          >
            ✏️
          </button>
          <button 
            onClick={() => onDelete(task.id)} 
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete Task"
          >
            🗑️
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
