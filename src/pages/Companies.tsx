import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Calendar, MapPin, Banknote, Briefcase, RefreshCw, AlertCircle, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import type { CompanyWithEvents } from '../types/company';
import { getCompaniesWithEvents } from '../services/companyService';
import { getCompanyInitials } from '../utils/formatUtils';
import { getEventTimingStatus, formatEventDateTime, parseAsIST } from '../utils/dateUtils';
import { CompanySkeletonGrid } from '../components/LoadingSkeleton';

type CompanyFilterType = 'ALL' | 'UPCOMING' | 'PAST';

export const Companies: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyWithEvents[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<CompanyFilterType>('ALL');

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompaniesWithEvents();
      setCompanies(data);
    } catch {
      setError('Unable to load placement company directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const counts = useMemo(() => {
    let upcomingCount = 0;
    let pastCount = 0;

    companies.forEach((c) => {
      const hasUpcoming = c.events.some(
        (evt) => getEventTimingStatus(evt.dateTime, evt.date) !== 'PAST'
      );
      const isPastOnly =
        c.events.length > 0 &&
        c.events.every((evt) => getEventTimingStatus(evt.dateTime, evt.date) === 'PAST');

      if (hasUpcoming) upcomingCount++;
      if (isPastOnly) pastCount++;
    });

    return {
      all: companies.length,
      upcoming: upcomingCount,
      past: pastCount,
    };
  }, [companies]);

  const displayedCompanies = useMemo(() => {
    // 1. Search Query & Tab Filter
    const filtered = companies.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.companyName.toLowerCase().includes(q);
        const matchesLoc = c.location.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        const matchesLegacyPkg = c.package ? c.package.toLowerCase().includes(q) : false;
        const matchesLegacyRole = c.roleOffered ? c.roleOffered.toLowerCase().includes(q) : false;
        const matchesRoles = c.roles
          ? c.roles.some(
              (r) => r.roleName.toLowerCase().includes(q) || r.ctc.toLowerCase().includes(q)
            )
          : false;

        if (
          !matchesName &&
          !matchesLoc &&
          !matchesDesc &&
          !matchesLegacyPkg &&
          !matchesLegacyRole &&
          !matchesRoles
        ) {
          return false;
        }
      }

      const hasUpcoming = c.events.some(
        (evt) => getEventTimingStatus(evt.dateTime, evt.date) !== 'PAST'
      );
      const isPastOnly =
        c.events.length > 0 &&
        c.events.every((evt) => getEventTimingStatus(evt.dateTime, evt.date) === 'PAST');

      if (activeFilter === 'UPCOMING') return hasUpcoming;
      if (activeFilter === 'PAST') return isPastOnly;
      return true;
    });

    // 2. Sort: Upcoming first (sorted by nearest next event date), Past second, No events last
    return [...filtered].sort((a, b) => {
      const upcomingA = a.events
        .filter((e) => getEventTimingStatus(e.dateTime, e.date) !== 'PAST')
        .sort((x, y) => parseAsIST(x.dateTime).getTime() - parseAsIST(y.dateTime).getTime());
      const upcomingB = b.events
        .filter((e) => getEventTimingStatus(e.dateTime, e.date) !== 'PAST')
        .sort((x, y) => parseAsIST(x.dateTime).getTime() - parseAsIST(y.dateTime).getTime());

      const timeA = upcomingA.length > 0 ? parseAsIST(upcomingA[0].dateTime).getTime() : null;
      const timeB = upcomingB.length > 0 ? parseAsIST(upcomingB[0].dateTime).getTime() : null;

      const isPastA = a.events.length > 0 && upcomingA.length === 0;
      const isPastB = b.events.length > 0 && upcomingB.length === 0;

      if (timeA !== null && timeB !== null) return timeA - timeB;
      if (timeA !== null && timeB === null) return -1;
      if (timeA === null && timeB !== null) return 1;

      if (isPastA && !isPastB) return -1;
      if (!isPastA && isPastB) return 1;

      return a.companyName.localeCompare(b.companyName);
    });
  }, [companies, searchQuery, activeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* HEADER SECTION */}
      <section className="bg-slate-900 text-white pt-6 pb-8 sm:pt-10 sm:pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Companies
            </h1>
            <p className="text-indigo-200/90 text-sm sm:text-base font-medium">
              View all placement companies and their activities.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="pt-2">
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="block w-full pl-10 pr-10 py-3 sm:py-3.5 bg-slate-800/90 border border-slate-700 rounded-2xl text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-3 animate-fade-in">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="text-sm font-bold text-red-900">{error}</h3>
            <button
              onClick={fetchCompanies}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RETRY</span>
            </button>
          </div>
        )}

        {loading && <CompanySkeletonGrid count={5} />}

        {!loading && !error && (
          <>
            {/* FILTER TABS */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer min-h-[38px] ${
                  activeFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All ({counts.all})
              </button>

              <button
                onClick={() => setActiveFilter('UPCOMING')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer min-h-[38px] ${
                  activeFilter === 'UPCOMING'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Upcoming ({counts.upcoming})
              </button>

              <button
                onClick={() => setActiveFilter('PAST')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer min-h-[38px] ${
                  activeFilter === 'PAST'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Past ({counts.past})
              </button>
            </div>

            {/* COMPACT COMPANY LIST ROWS */}
            {displayedCompanies.length > 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {displayedCompanies.map((comp) => {
                  const upcomingEvts = comp.events
                    .filter((e) => getEventTimingStatus(e.dateTime, e.date) !== 'PAST')
                    .sort((a, b) => parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime());

                  const nextEvt = upcomingEvts.length > 0 ? upcomingEvts[0] : undefined;
                  const hasEvents = comp.events.length > 0;
                  const isPastOnly = hasEvents && upcomingEvts.length === 0;

                  return (
                    <div
                      key={comp.companyId}
                      onClick={() => navigate(`/company/${comp.companyId}`)}
                      className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
                    >
                      {/* LEFT: LOGO & COMPANY META */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {comp.logoUrl ? (
                          <img
                            src={comp.logoUrl}
                            alt={`${comp.companyName} logo`}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200 shadow-2xs shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-sm sm:text-base shadow-inner shrink-0 ${
                            comp.logoUrl ? 'hidden' : ''
                          }`}
                        >
                          {getCompanyInitials(comp.companyName)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors truncate">
                            {comp.companyName}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{comp.location}</span>
                          </div>

                          <div className="mt-2 space-y-1">
                            {comp.roles && comp.roles.length > 0 ? (
                              <>
                                {comp.roles.slice(0, 2).map((r, idx) => (
                                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-xs">
                                    <span className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                                      <Briefcase className="w-3 h-3 text-indigo-500 shrink-0" />
                                      <span className="truncate">{r.roleName}</span>
                                    </span>
                                    <span className="hidden sm:inline text-slate-300">—</span>
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/80 w-max text-[11px]">
                                      {r.ctc}
                                    </span>
                                  </div>
                                ))}
                                {comp.roles.length > 2 && (
                                  <span className="inline-block text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5">
                                    + {comp.roles.length - 2} more role{comp.roles.length - 2 > 1 ? 's' : ''}
                                  </span>
                                )}
                              </>
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-xs">
                                <span className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                                  <Briefcase className="w-3 h-3 text-indigo-500 shrink-0" />
                                  <span className="truncate">{comp.roleOffered || 'Software Engineer'}</span>
                                </span>
                                <span className="hidden sm:inline text-slate-300">—</span>
                                <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/80 w-max text-[11px]">
                                  {comp.package || 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: NEXT ACTIVITY, STATUS BADGE & CHEVRON */}
                      <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        {/* NEXT ACTIVITY TEXT */}
                        <div className="text-xs space-y-0.5">
                          {nextEvt ? (
                            <>
                              <p className="font-bold text-slate-800 flex items-center gap-1">
                                <span>{nextEvt.title}</span>
                              </p>
                              <p className="text-slate-500 font-medium flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                {formatEventDateTime(nextEvt)}
                              </p>
                            </>
                          ) : (
                            <p className="text-slate-500 font-medium flex items-center gap-1">
                              <span>No upcoming activity</span>
                            </p>
                          )}
                        </div>

                        {/* STATUS BADGE & ARROW */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          {nextEvt ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              UPCOMING
                            </span>
                          ) : isPastOnly ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                              <CheckCircle2 className="w-3 h-3 text-slate-400" />
                              PAST
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                              NO ACTIVITY
                            </span>
                          )}

                          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-3 my-6">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  {searchQuery
                    ? `No companies found matching "${searchQuery}"`
                    : 'No placement companies available.'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchQuery
                    ? 'Try adjusting your search terms or filter tabs.'
                    : 'Company directory information will appear here when companies are added.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                  >
                    Clear search query
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Companies;
