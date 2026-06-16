import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { toast } from "react-toastify";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Schedule", path: "/schedule", icon: "📅" },
    { name: "Tasks", path: "/tasks", icon: "📋" },
    { name: "Analytics", path: "/analytics", icon: "📈" },
    { name: "AI Coach", path: "/ai-assistant", icon: "🤖" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 glass-morphism border-r border-white/10 transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:translate-x-0 lg:static lg:inset-0 rounded-r-[3rem] ml-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 px-2 mb-10 mt-2">
            <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-brand-600/30">
              🚀
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Study<span className="text-brand-600 dark:text-brand-400">AI</span>
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => isMobile && setIsOpen(false)}
                className={({ isActive }) => `
                  group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300
                  ${isActive 
                    ? "bg-brand-600 text-white shadow-xl shadow-brand-600/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:translate-x-2"}
                `}
              >
                <span className={`text-xl transition-transform group-hover:scale-125 duration-300`}>
                  {link.icon}
                </span>
                <span className="font-bold tracking-tight">
                  {link.name}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto p-2">
            <div className="p-5 glass-morphism rounded-3xl bg-brand-500/5 border-brand-500/10">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Join Pro Plan</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Unlock AI suggestions and more</p>
              <button
                type="button"
                onClick={() => toast.info('Pro plan coming soon!')}
                className="w-full mt-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
