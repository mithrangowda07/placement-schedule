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
import { getEventTimingStatus, isEventThisWeek, parseAsIST } from '../utils/dateUtils';
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
        c.package.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  const allEventsFlattened = useMemo(() => {
    const events: EventWithCompanyMeta[] = [];
    filteredCompanies.forEach((comp) => {
      comp.events.forEach((evt) => {
        events.push({
          ...evt,
          companyName: comp.companyName,
          companyPackage: comp.package,
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
    let thisWeekCount = 0;

    allEventsFlattened.forEach((evt) => {
      const timingStatus = getEventTimingStatus(evt.dateTime);
      const isThisWk = isEventThisWeek(evt.dateTime);

      if (timingStatus === 'TODAY') todayCount++;
      if (timingStatus === 'TOMORROW') tomorrowCount++;
      if (isThisWk) thisWeekCount++;

      if (timingStatus === 'PAST') {
        past.push(evt);
      } else {
        upcoming.push(evt);
        if (timingStatus === 'TODAY' || timingStatus === 'TOMORROW') {
          important.push(evt);
        }
      }
    });

    upcoming.sort((a, b) => parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime());
    important.sort((a, b) => parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime());
    past.sort((a, b) => parseAsIST(b.dateTime).getTime() - parseAsIST(a.dateTime).getTime());

    return {
      importantEvents: important,
      upcomingEvents: upcoming,
      pastEvents: past,
      filterCounts: {
        all: upcoming.length,
        today: todayCount,
        tomorrow: tomorrowCount,
        thisWeek: thisWeekCount,
      },
    };
  }, [allEventsFlattened]);

  const displayedCompanies = useMemo(() => {
    if (activeFilter === 'ALL') return filteredCompanies;

    return filteredCompanies.filter((comp) => {
      return comp.events.some((evt) => {
        const timingStatus = getEventTimingStatus(evt.dateTime);
        if (activeFilter === 'TODAY') return timingStatus === 'TODAY';
        if (activeFilter === 'TOMORROW') return timingStatus === 'TOMORROW';
        if (activeFilter === 'THIS_WEEK') return isEventThisWeek(evt.dateTime);
        return true;
      });
    });
  }, [filteredCompanies, activeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <section className="bg-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              RVCE Placement Season 2026
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              RVCE Placement Hub
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Stay updated with placement registrations, assessments, interviews and important recruitment events in real-time.
            </p>
          </div>

          <div className="mt-8">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-red-900">{error}</h3>
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
            {importantEvents.length > 0 && (
              <section className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-indigo-500/10 p-5 sm:p-6 rounded-3xl border border-red-200/80 shadow-xs relative overflow-hidden animate-fade-in">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold shadow-sm">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Important Deadlines</h2>
                    <p className="text-xs text-slate-600">Urgent recruitment activities happening Today & Tomorrow</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {importantEvents.map((evt) => (
                    <EventCard key={evt.eventId} event={evt} companyName={evt.companyName} showCompanyHeader={true} />
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-200/80 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Upcoming Placement Drives</h2>
                <p className="text-xs text-slate-500">Sorted chronologically by event date & time</p>
              </div>

              <FilterBar
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
                counts={filterCounts}
              />
            </div>

            {displayedCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCompanies.map((comp) => (
                  <CompanyCard key={comp.companyId} company={comp} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 my-8">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
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

            {pastEvents.length > 0 && (
              <div className="pt-8 border-t border-slate-200">
                <button
                  onClick={() => setShowPastEvents(!showPastEvents)}
                  className="flex items-center justify-between w-full p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Completed / Past Events ({pastEvents.length})
                  </span>
                  {showPastEvents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showPastEvents && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
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
