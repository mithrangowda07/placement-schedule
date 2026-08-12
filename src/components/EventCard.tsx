import React from 'react';
import { Calendar, Clock, ExternalLink, Flame, CheckCircle2 } from 'lucide-react';
import type { PlacementEvent } from '../types/event';
import { EVENT_TYPE_LABELS, EVENT_TYPE_BUTTON_TEXT } from '../types/event';
import { getEventTimingStatus, formatDateFriendly, formatTime12H, formatEventDateTime } from '../utils/dateUtils';

interface EventCardProps {
  event: PlacementEvent;
  companyName?: string;
  showCompanyHeader?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, companyName, showCompanyHeader = false }) => {
  const timingStatus = getEventTimingStatus(event.dateTime);

  const getStatusBadge = () => {
    switch (timingStatus) {
      case 'TODAY':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-red-200 animate-pulse">
            <Flame className="w-3 h-3 text-red-600" />
            TODAY
          </span>
        );
      case 'TOMORROW':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            TOMORROW
          </span>
        );
      case 'PAST':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[11px] font-medium px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-slate-400" />
            COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-blue-200">
            <Calendar className="w-3 h-3 text-blue-500" />
            UPCOMING
          </span>
        );
    }
  };

  const buttonText = EVENT_TYPE_BUTTON_TEXT[event.eventType] || 'VIEW LINK';
  const displayTitle = event.eventType === 'OTHER' && event.title ? event.title : EVENT_TYPE_LABELS[event.eventType] || event.title;

  return (
    <div className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all ${
      timingStatus === 'TODAY'
        ? 'border-red-200 shadow-sm bg-gradient-to-r from-red-50/30 to-white'
        : timingStatus === 'TOMORROW'
        ? 'border-amber-200 shadow-xs'
        : 'border-slate-200/80 shadow-2xs'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          {showCompanyHeader && companyName && (
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {companyName}
            </span>
          )}
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-base sm:text-lg">
              {displayTitle}
            </h4>
            {getStatusBadge()}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium pt-1">
            <span className="flex items-center gap-1 font-semibold text-indigo-700">
              <Calendar className="w-4 h-4 text-indigo-500" />
              {formatEventDateTime(event)}
            </span>
          </div>

          {event.description && (
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {event.description}
            </p>
          )}
        </div>

        {event.url ? (
          <div className="sm:self-center pt-2 sm:pt-0 w-full sm:w-auto">
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 min-h-[42px] bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200 cursor-pointer"
            >
              <span>{buttonText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
};
