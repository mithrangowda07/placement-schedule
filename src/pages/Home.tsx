import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, Flame, Calendar, RefreshCw, ChevronDown, ChevronUp, AlertCircle, Building2 } from 'lucide-react';
import type { CompanyWithEvents } from '../types/company';
import { getCompaniesWithEvents } from '../services/companyService';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import type { FilterOption } from '../components/FilterBar';
import { CompanyCard } from '../components/CompanyCard';
import { EventCard } from '../components/EventCard';
import { CompanySkeletonGrid } from '../components/LoadingSkeleton';
import { getEventTimingStatus, getISTDateString, formatDateCompact, parseAsIST, getEventPriorityScore } from '../utils/dateUtils';
import type { PlacementEvent } from '../types/event';

interface EventWithCompanyMeta extends PlacementEvent {
  companyName: string;
  companyPackage: string;
  companyLocation: string;
  companyLogoUrl?: string;
}

export const Home: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyWithEvents[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showPastEvents, setShowPastEvents] = useState<boolean>(false);

  const fetchPlacementData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompaniesWithEvents();
      setCompanies(data);
    } catch {
      setError('Unable to load placement information. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase().trim();
    return companies.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.package && c.package.toLowerCase().includes(q)) ||
        (c.roleOffered && c.roleOffered.toLowerCase().includes(q)) ||
        (c.roles && c.roles.some((r) => r.roleName.toLowerCase().includes(q) || r.ctc.toLowerCase().includes(q)))
    );
  }, [companies, searchQuery]);

  const allEventsFlattened = useMemo(() => {
    const events: EventWithCompanyMeta[] = [];
    filteredCompanies.forEach((comp) => {
      comp.events.forEach((evt) => {
        events.push({
          ...evt,
          companyName: comp.companyName,
          companyPackage: comp.roles && comp.roles.length > 0 ? comp.roles[0].ctc : comp.package || 'N/A',
          companyLocation: comp.location,
          companyLogoUrl: comp.logoUrl,
        });
      });
    });
    return events;
  }, [filteredCompanies]);

  const { importantEvents, pastEvents, filterCounts } = useMemo(() => {
    const upcoming: EventWithCompanyMeta[] = [];
    const past: EventWithCompanyMeta[] = [];
    const important: EventWithCompanyMeta[] = [];

    let todayCount = 0;
    let tomorrowCount = 0;
    let selectedDateCount = 0;

    allEventsFlattened.forEach((evt) => {
      const timingStatus = getEventTimingStatus(evt.dateTime, evt.date);
      const evtDateStr = evt.date || getISTDateString(evt.dateTime);

      if (timingStatus === 'TODAY') todayCount++;
      if (timingStatus === 'TOMORROW') tomorrowCount++;
      if (selectedDate && evtDateStr === selectedDate) selectedDateCount++;

      if (timingStatus === 'PAST') {
        past.push(evt);
      } else {
        upcoming.push(evt);
        if (timingStatus === 'TODAY' || timingStatus === 'TOMORROW') {
          important.push(evt);
        }
      }
    });

    upcoming.sort((a, b) => {
      const prioA = getEventPriorityScore(a);
      const prioB = getEventPriorityScore(b);
      if (prioA !== prioB) return prioA - prioB;
      return parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime();
    });

    important.sort((a, b) => {
      const prioA = getEventPriorityScore(a);
      const prioB = getEventPriorityScore(b);
      if (prioA !== prioB) return prioA - prioB;
      return parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime();
    });

    past.sort((a, b) => parseAsIST(b.dateTime).getTime() - parseAsIST(a.dateTime).getTime());

    return {
      importantEvents: important,
      upcomingEvents: upcoming,
      pastEvents: past,
      filterCounts: {
        all: upcoming.length,
        today: todayCount,
        tomorrow: tomorrowCount,
        selectedDateCount,
      },
    };
  }, [allEventsFlattened, selectedDate]);

  const upcomingCompanies = useMemo(() => {
    return filteredCompanies.filter((comp) =>
      comp.events.some((evt) => getEventTimingStatus(evt.dateTime, evt.date) !== 'PAST')
    );
  }, [filteredCompanies]);

  const displayedCompanies = useMemo(() => {
    // When user is searching or choosing a specific date, search across all companies (upcoming & past)
    const baseList = searchQuery.trim() || activeFilter === 'DATE' ? filteredCompanies : upcomingCompanies;

    let result = baseList;
    if (activeFilter !== 'ALL') {
      result = baseList.filter((comp) => {
        return comp.events.some((evt) => {
          const timingStatus = getEventTimingStatus(evt.dateTime, evt.date);
          if (activeFilter === 'TODAY') return timingStatus === 'TODAY';
          if (activeFilter === 'TOMORROW') return timingStatus === 'TOMORROW';
          if (activeFilter === 'DATE') {
            if (!selectedDate) return true;
            const evtDateStr = evt.date || getISTDateString(evt.dateTime);
            return evtDateStr === selectedDate;
          }
          return true;
        });
      });
    }

    return [...result].sort((a, b) => {
      const isPastA = !a.nextEvent;
      const isPastB = !b.nextEvent;

      if (!isPastA && isPastB) return -1;
      if (isPastA && !isPastB) return 1;

      const timeA = a.nextEvent ? parseAsIST(a.nextEvent.dateTime).getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = b.nextEvent ? parseAsIST(b.nextEvent.dateTime).getTime() : Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });
  }, [searchQuery, activeFilter, selectedDate, filteredCompanies, upcomingCompanies]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* MOBILE-FIRST HERO HEADER */}
      <section className="bg-slate-900 text-white pt-6 pb-8 sm:pt-10 sm:pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3" />
              RVCE Placement Season 2026
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              RVCE Placement Updates
            </h1>
            <p className="text-slate-300/80 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl">
              Get the latest RVCE placement updates, company registration deadlines, online assessment dates, interview schedules and other important placement activities in one place.
            </p>
          </div>

          <div className="pt-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 sm:space-y-10">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-3 animate-fade-in">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="text-sm font-bold text-red-900">{error}</h3>
            <button
              onClick={fetchPlacementData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RETRY</span>
            </button>
          </div>
        )}

        {loading && <CompanySkeletonGrid count={6} />}

        {!loading && !error && (
          <>
            {/* IMPORTANT SECTION */}
            {importantEvents.length > 0 && (
              <section className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-indigo-500/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-red-200/80 shadow-xs relative overflow-hidden animate-fade-in space-y-3">
                <div className="flex items-center gap-2.5 border-b border-red-200/50 pb-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight uppercase">
                      IMPORTANT
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">Urgent placement deadlines today & tomorrow</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {importantEvents.map((evt) => (
                    <EventCard key={evt.eventId} event={evt} companyName={evt.companyName} showCompanyHeader={true} />
                  ))}
                </div>
              </section>
            )}

            {/* UPCOMING SECTION */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
                    {searchQuery.trim()
                      ? `SEARCH RESULTS (${displayedCompanies.length})`
                      : activeFilter === 'DATE'
                      ? selectedDate
                        ? `ACTIVITIES ON ${formatDateCompact(selectedDate)} (${displayedCompanies.length})`
                        : `CHOOSE A DATE (${displayedCompanies.length})`
                      : 'UPCOMING'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {searchQuery.trim()
                      ? `Showing placement drives matching "${searchQuery}" (upcoming & past)`
                      : activeFilter === 'DATE' && selectedDate
                      ? `Placement drives with scheduled activities on ${formatDateCompact(selectedDate)}`
                      : 'Placement drives & activities'}
                  </p>
                </div>

                <FilterBar
                  activeFilter={activeFilter}
                  onSelectFilter={setActiveFilter}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  counts={filterCounts}
                />
              </div>

              {displayedCompanies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {displayedCompanies.map((comp) => (
                    <CompanyCard key={comp.companyId} company={comp} />
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-3 my-6">
                  <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">
                    {searchQuery
                      ? `No companies found matching "${searchQuery}"`
                      : 'No upcoming placement activities.'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {searchQuery
                      ? 'Try adjusting your search terms or filter options.'
                      : 'Placement information will appear here when companies are added.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* COMPLETED / PAST EVENTS */}
            {pastEvents.length > 0 && (
              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowPastEvents(!showPastEvents)}
                  className="flex items-center justify-between w-full p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Completed / Past Events ({pastEvents.length})
                  </span>
                  {showPastEvents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showPastEvents && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-fade-in">
                    {pastEvents.map((evt) => (
                      <EventCard key={evt.eventId} event={evt} companyName={evt.companyName} showCompanyHeader={true} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
