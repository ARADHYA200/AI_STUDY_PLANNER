import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const auth = useAuth();
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const logout = auth?.logout;

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
              SA
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              StudyAI
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-emerald-600 transition">
                  Dashboard
                </Link>
                <Link to="/subjects" className="hover:text-emerald-600 transition">
                  Subjects
                </Link>
                <Link to="/schedule" className="hover:text-emerald-600 transition">
                  Schedule
                </Link>
                <Link to="/analytics" className="hover:text-emerald-600 transition">
                  Analytics
                </Link>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">{user?.name}</span>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="bg-emerald-600 text-white px-5 py-2 rounded-xl"
                  >
                    Logout
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-emerald-600 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 text-white px-5 py-2 rounded-xl hover:bg-emerald-700 transition shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <svg
              className="h-6 w-6 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3"
          >
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block">
                  Dashboard
                </Link>
                <Link to="/subjects" onClick={() => setMenuOpen(false)} className="block">
                  Subjects
                </Link>
                <Link to="/schedule" onClick={() => setMenuOpen(false)} className="block">
                  Schedule
                </Link>
                <Link to="/analytics" onClick={() => setMenuOpen(false)} className="block">
                  Analytics
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full bg-emerald-600 text-white px-4 py-2 rounded-xl mt-3"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block">
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block bg-emerald-600 text-white px-4 py-2 rounded-xl mt-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;