import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const loader = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading experience...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center">
        {loader}
      </div>
    );
  }

  return loader;
};

export default Loader;
