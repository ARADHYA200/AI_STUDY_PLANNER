const Badge = ({ variant, label }) => {
  const colors = {
    High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-center block mt-2",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[variant] || colors.Low}`}>
      {label || variant}
    </span>
  );
};

export default Badge;
