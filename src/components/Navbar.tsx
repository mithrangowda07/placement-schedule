import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ShieldCheck, LogOut, Building2 } from 'lucide-react';
import { isAuthenticated, logoutAdmin, getAdminUsername } from '../services/authService';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = isAuthenticated();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800 backdrop-blur-md bg-opacity-95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-lg p-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  RVCE Placement Hub
                </span>
                <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  2026 Batch
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Rashtreeya Vidyalaya College of Engineering • Campus Placements
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Companies</span>
            </Link>

            {isAuth ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin/dashboard')
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-indigo-300 border border-indigo-500/30 hover:bg-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  <span className="hidden sm:inline">Admin Portal</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title={`Logout (${getAdminUsername()})`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/60 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              isAdminRoute && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Login</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
