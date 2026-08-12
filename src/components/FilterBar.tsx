import React from 'react';
import { Calendar, Flame, Clock, Sparkles } from 'lucide-react';

export type FilterOption = 'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK';

interface FilterBarProps {
  activeFilter: FilterOption;
  onSelectFilter: (filter: FilterOption) => void;
  counts: {
    all: number;
    today: number;
    tomorrow: number;
    thisWeek: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onSelectFilter, counts }) => {
  const filters: { id: FilterOption; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'ALL', label: 'All Upcoming', icon: <Sparkles className="w-4 h-4" />, count: counts.all },
    { id: 'TODAY', label: 'Today', icon: <Flame className="w-4 h-4 text-red-500" />, count: counts.today },
    { id: 'TOMORROW', label: 'Tomorrow', icon: <Clock className="w-4 h-4 text-amber-500" />, count: counts.tomorrow },
    { id: 'THIS_WEEK', label: 'This Week', icon: <Calendar className="w-4 h-4 text-blue-500" />, count: counts.thisWeek },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
      {filters.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onSelectFilter(f.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {f.icon}
            <span>{f.label}</span>
            <span
              className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
