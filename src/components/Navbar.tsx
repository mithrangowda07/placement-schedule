import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, ShieldCheck, LogOut, Menu, X, Home, Building2 } from 'lucide-react';
import { isAuthenticated, logoutAdmin, getAdminUsername } from '../services/authService';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = isAuthenticated();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Automatically close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800 backdrop-blur-md bg-opacity-95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-20">
          {/* Brand Logo & Title */}
          <Link
            to="/"
            className="flex items-center gap-2.5 md:gap-3 group focus:outline-none rounded-lg p-0.5 min-w-0"
          >
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <GraduationCap className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base md:text-xl tracking-tight text-white group-hover:text-indigo-200 transition-colors whitespace-nowrap">
                  RVCE Placement Updates
                </span>
                <span className="hidden md:inline-block bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                  2026 Batch
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                Rashtreeya Vidyalaya College of Engineering • Campus Placements
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION ITEMS (>= md / 768px) */}
          <div className="hidden md:flex items-center gap-3 md:gap-4">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Home</span>
            </Link>

            <Link
              to="/companies"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/companies'
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Companies</span>
            </Link>

            {isAuth ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin/dashboard')
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-indigo-300 border border-indigo-500/30 hover:bg-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  <span>Admin Portal</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title={`Logout (${getAdminUsername()})`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/60 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              isAdminRoute && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Login</span>
                </Link>
              )
            )}
          </div>

          {/* MOBILE HAMBURGER TOGGLE BUTTON (< md / 768px) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-indigo-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU (< md / 768px) */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900/98 border-t border-slate-800 px-4 py-3 space-y-1.5 shadow-2xl backdrop-blur-md">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              location.pathname === '/'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-300" />
            <span>Home</span>
          </Link>

          <Link
            to="/companies"
            onClick={() => setIsMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              location.pathname === '/companies'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-300" />
            <span>Companies</span>
          </Link>

          {isAuth ? (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/admin/dashboard')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-300" />
                <span>Admin Dashboard</span>
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Logout ({getAdminUsername()})</span>
              </button>
            </>
          ) : (
            isAdminRoute && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-300" />
                <span>Admin Login</span>
              </Link>
            )
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
