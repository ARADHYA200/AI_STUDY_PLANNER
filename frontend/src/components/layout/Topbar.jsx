import React from 'react';
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";

const Topbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Overview";
    const title = path.split('/').filter(Boolean).pop();
    if (!title) return "Dashboard";
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 sm:px-10 bg-slate-50/50 dark:bg-[#020617]/50 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-3 text-slate-500 hover:bg-white dark:hover:bg-slate-800 rounded-2xl lg:hidden glass-morphism border-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden sm:block">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {getPageTitle()}
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Study Flow</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden md:flex glass-morphism px-4 py-2 rounded-2xl items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Live Updates</span>
        </div>
        
        <ThemeToggle />
        
        <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center gap-3 group cursor-pointer relative">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
            <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase">{user?.studyLevel || 'Student'}</p>
          </div>
          <button 
            onClick={logout}
            className="w-12 h-12 flex items-center justify-center rounded-2xl glass-morphism bg-brand-500/10 text-brand-600 dark:text-brand-400 font-black border-none hover:bg-brand-600 hover:text-white transition-all shadow-lg shadow-brand-500/10"
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
