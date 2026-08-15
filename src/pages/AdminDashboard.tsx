import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Calendar, Flame, Plus, Edit, Trash2, ShieldCheck, Sparkles, RefreshCw, Search } from 'lucide-react';
import type { CompanyWithEvents } from '../types/company';
import { getCompaniesWithEvents, deleteCompany } from '../services/companyService';
import { ConfirmModal } from '../components/ConfirmModal';
import { getEventTimingStatus, isEventThisWeek, parseAsIST } from '../utils/dateUtils';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyWithEvents[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getCompaniesWithEvents();
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCompanies = React.useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase().trim();
    return companies.filter((c) => {
      const matchesName = c.companyName.toLowerCase().includes(q);
      const matchesLoc = c.location.toLowerCase().includes(q);
      const matchesDesc = c.description ? c.description.toLowerCase().includes(q) : false;
      const matchesLegacyPkg = c.package ? c.package.toLowerCase().includes(q) : false;
      const matchesLegacyRole = c.roleOffered ? c.roleOffered.toLowerCase().includes(q) : false;
      const matchesRoles = c.roles
        ? c.roles.some((r) => r.roleName.toLowerCase().includes(q) || r.ctc.toLowerCase().includes(q))
        : false;

      return (
        matchesName ||
        matchesLoc ||
        matchesDesc ||
        matchesLegacyPkg ||
        matchesLegacyRole ||
        matchesRoles
      );
    });
  }, [companies, searchQuery]);

  const stats = React.useMemo(() => {
    let totalEvents = 0;
    let eventsToday = 0;
    let eventsThisWeek = 0;
    const nowMs = Date.now();

    companies.forEach((comp) => {
      comp.events.forEach((evt) => {
        const timingStatus = getEventTimingStatus(evt.dateTime, evt.date);
        const isThisWk = isEventThisWeek(evt.dateTime, evt.date);

        if (timingStatus !== 'PAST') totalEvents++;
        if (timingStatus === 'TODAY') eventsToday++;
        if (isThisWk) eventsThisWeek++;
      });
    });

    return {
      totalCompanies: companies.length,
      totalEvents,
      eventsToday,
      eventsThisWeek,
    };
  }, [companies]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteCompany(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-slate-900 text-white py-5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight text-white">RVCE Placement Updates Dashboard</h1>
              <p className="text-xs text-slate-400">Admin Management Portal</p>
            </div>
          </div>

          <Link
            to="/admin/company/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD COMPANY</span>
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Total Companies</span>
              <Building2 className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-slate-900">{stats.totalCompanies}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Upcoming Events</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-slate-900">{stats.totalEvents}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Events Today</span>
              <Flame className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-red-600">{stats.eventsToday}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Events This Week</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-3xl font-extrabold text-slate-900">{stats.eventsThisWeek}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Placement Companies {searchQuery.trim() ? `(${filteredCompanies.length})` : ''}
              </h2>
              <p className="text-xs text-slate-500">Manage companies, packages, locations, and events</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies, roles..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              <button
                onClick={loadData}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading companies...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-8 sm:p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                {searchQuery ? `No companies found matching "${searchQuery}"` : 'No companies added yet.'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                >
                  Clear search query
                </button>
              ) : (
                <Link
                  to="/admin/company/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-500 transition-colors min-h-[42px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ADD COMPANY</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCompanies.map((comp) => (
                <div
                  key={comp.companyId}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{comp.companyName}</h3>
                      <span className="text-xs text-slate-500 font-medium">
                        • {comp.location} • <span className="font-semibold text-indigo-600">{comp.events.length} events scheduled</span>
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      {comp.roles && comp.roles.length > 0 ? (
                        <>
                          {comp.roles.slice(0, 2).map((r, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 font-medium">
                              <span className="font-semibold text-slate-800">{r.roleName}</span>
                              <span className="text-slate-400">—</span>
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/80">{r.ctc}</span>
                            </div>
                          ))}
                          {comp.roles.length > 2 && (
                            <span className="inline-block text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5">
                              + {comp.roles.length - 2} more role{comp.roles.length - 2 > 1 ? 's' : ''}
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {comp.roleOffered && <span className="font-semibold text-slate-800">{comp.roleOffered}</span>}
                          {comp.package && <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{comp.package}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                    <button
                      onClick={() => navigate(`/admin/company/${comp.companyId}/edit`)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer min-h-[42px]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>EDIT</span>
                    </button>

                    <button
                      onClick={() => setDeleteTarget({ id: comp.companyId, name: comp.companyName })}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer min-h-[42px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>DELETE</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.name || 'Company'}?`}
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action will permanently remove the company and all its associated events.`}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
