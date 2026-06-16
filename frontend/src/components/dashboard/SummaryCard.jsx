import { motion } from "framer-motion";

const SummaryCard = ({ title, value, subtitle, icon, colorClass = "bg-indigo-50 text-indigo-600 border-indigo-100" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      className={`relative overflow-hidden rounded-2xl p-6 border ${colorClass} bg-white dark:bg-gray-800 transition-all`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">{subtitle}</p>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${colorClass.split(' ')[0]} bg-opacity-50 dark:bg-opacity-20`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      
      {/* Decorative Background Blob */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 bg-current pointer-events-none" />
    </motion.div>
  );
};

export default SummaryCard;
