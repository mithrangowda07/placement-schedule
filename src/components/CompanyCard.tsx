import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Banknote, Calendar, ArrowRight, ExternalLink, Flame, Clock, Briefcase } from 'lucide-react';
import type { CompanyWithEvents } from '../types/company';
import { EVENT_TYPE_BUTTON_TEXT, EVENT_TYPE_LABELS } from '../types/event';
import { formatEventDateTime, getEventTimingStatus } from '../utils/dateUtils';
import { getCompanyInitials, truncateText } from '../utils/formatUtils';

interface CompanyCardProps {
  company: CompanyWithEvents;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const nextEvent = company.nextEvent;
  const timingStatus = nextEvent ? getEventTimingStatus(nextEvent.dateTime) : null;

  const getBadgeStyle = () => {
    if (!timingStatus) return 'bg-slate-100 text-slate-600 border-slate-200';
    switch (timingStatus) {
      case 'TODAY':
        return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      case 'TOMORROW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FUTURE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = () => {
    if (timingStatus === 'TODAY') return <Flame className="w-3.5 h-3.5 text-red-500" />;
    if (timingStatus === 'TOMORROW') return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    return <Calendar className="w-3.5 h-3.5 text-blue-500" />;
  };

  const getActionButtonText = () => {
    if (!nextEvent) return 'REGISTER NOW';
    return EVENT_TYPE_BUTTON_TEXT[nextEvent.eventType] || 'REGISTER NOW';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.companyName} logo`}
                className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200 shadow-2xs shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold flex items-center justify-center text-lg shadow-inner shrink-0 ${
                company.logoUrl ? 'hidden' : ''
              }`}
            >
              {getCompanyInitials(company.companyName)}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors leading-snug">
                {company.companyName}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-500">
                {company.roleOffered && (
                  <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/80">
                    <Briefcase className="w-3 h-3 text-indigo-500" />
                    {company.roleOffered}
                  </span>
                )}
                <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  {company.package}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {company.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-3.5 leading-relaxed">
          {truncateText(company.description, 130)}
        </p>

        {nextEvent ? (
          <div className="bg-slate-50/80 rounded-xl p-3 sm:p-3.5 border border-slate-200/60 mb-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                Next Activity
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${getBadgeStyle()}`}
              >
                {getStatusIcon()}
                {timingStatus === 'TODAY'
                  ? 'CLOSING TODAY'
                  : timingStatus === 'TOMORROW'
                  ? 'TOMORROW'
                  : 'UPCOMING'}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-800">
              {nextEvent.title || EVENT_TYPE_LABELS[nextEvent.eventType]}
            </p>
            <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {formatEventDateTime(nextEvent)}
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-dashed border-slate-200 mb-1">
            <p className="text-xs text-slate-500">No active upcoming activities scheduled.</p>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {nextEvent && (nextEvent.url || company.registrationUrl) ? (
          <a
            href={nextEvent.url || company.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-2xs min-h-[42px]"
          >
            <span>{getActionButtonText()}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}

        <Link
          to={`/company/${company.companyId}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors min-h-[42px]"
        >
          <span>VIEW DETAILS</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
