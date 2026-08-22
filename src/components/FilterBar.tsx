import React, { useRef } from 'react';
import { CalendarDays, Flame, Clock, Sparkles, X } from 'lucide-react';
import { formatDateCompact, getISTDateString } from '../utils/dateUtils';

export type FilterOption = 'ALL' | 'TODAY' | 'TOMORROW' | 'DATE';

interface FilterBarProps {
  activeFilter: FilterOption;
  onSelectFilter: (filter: FilterOption) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  counts: {
    all: number;
    today: number;
    tomorrow: number;
    selectedDateCount: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onSelectFilter,
  selectedDate,
  onSelectDate,
  counts,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateButtonClick = () => {
    onSelectFilter('DATE');
    if (!selectedDate) {
      const todayStr = getISTDateString(Date.now());
      onSelectDate(todayStr);
    }
    if (dateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
          dateInputRef.current.click();
        }
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSelectDate(val);
    if (val) {
      onSelectFilter('DATE');
    }
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectDate('');
    onSelectFilter('ALL');
  };

  const isDateActive = activeFilter === 'DATE';

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-full overflow-x-auto pb-1 scrollbar-none scroll-smooth">
      {/* ALL UPCOMING */}
      <button
        type="button"
        onClick={() => onSelectFilter('ALL')}
        className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border min-h-[38px] ${
          activeFilter === 'ALL'
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>All Upcoming</span>
        <span
          className={`ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
            activeFilter === 'ALL' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {counts.all}
        </span>
      </button>

      {/* TODAY */}
      <button
        type="button"
        onClick={() => onSelectFilter('TODAY')}
        className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border min-h-[38px] ${
          activeFilter === 'TODAY'
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Flame className="w-4 h-4 text-red-500" />
        <span>Today</span>
        <span
          className={`ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
            activeFilter === 'TODAY' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {counts.today}
        </span>
      </button>

      {/* TOMORROW */}
      <button
        type="button"
        onClick={() => onSelectFilter('TOMORROW')}
        className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border min-h-[38px] ${
          activeFilter === 'TOMORROW'
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Clock className="w-4 h-4 text-amber-500" />
        <span>Tomorrow</span>
        <span
          className={`ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
            activeFilter === 'TOMORROW' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {counts.tomorrow}
        </span>
      </button>

      {/* CHOOSE DATE CALENDAR SELECTOR */}
      <div className="relative inline-flex items-center">
        <div
          onClick={handleDateButtonClick}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border min-h-[38px] ${
            isDateActive
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <CalendarDays className={`w-4 h-4 ${isDateActive ? 'text-white' : 'text-blue-500'}`} />

          <span>{selectedDate ? formatDateCompact(selectedDate) : 'Choose Date'}</span>

          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={handleDateInputChange}
            onClick={(e) => {
              e.stopPropagation();
              onSelectFilter('DATE');
            }}
            className="w-0 h-0 opacity-0 pointer-events-auto absolute"
            tabIndex={-1}
          />

          {selectedDate && (
            <span
              className={`ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                isDateActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.selectedDateCount}
            </span>
          )}

          {selectedDate && (
            <button
              type="button"
              onClick={handleClearDate}
              className={`ml-1 p-0.5 rounded-md hover:bg-black/10 transition-colors ${
                isDateActive ? 'text-indigo-100' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Clear date filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
