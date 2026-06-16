import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full glass-input rounded-2xl px-4 py-3 outline-none 
          ${error ? 'border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-700'} 
          placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white`}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-red-500 ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
