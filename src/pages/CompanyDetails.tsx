import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Banknote, MapPin, ExternalLink, AlertCircle, Briefcase } from 'lucide-react';
import type { CompanyWithEvents } from '../types/company';
import { getCompanyById } from '../services/companyService';
import { EventCard } from '../components/EventCard';
import { getCompanyInitials } from '../utils/formatUtils';
import { parseAsIST } from '../utils/dateUtils';

export const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyWithEvents | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const data = await getCompanyById(id);
      setCompany(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-pulse space-y-4 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto"></div>
          <div className="h-6 bg-slate-200 rounded-md w-1/2 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded-md w-3/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Company Not Found</h2>
        <p className="text-sm text-slate-600 max-w-sm">
          The company details you are looking for might have been removed or updated.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO COMPANIES</span>
        </Link>
      </div>
    );
  }

  const sortedEvents = [...company.events].sort(
    (a, b) => parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-slate-900 text-white py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-300 hover:text-white transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 sm:space-y-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`${company.companyName} logo`}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-contain bg-slate-50 p-2 border border-slate-200 shadow-2xs shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div
                className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0 ${
                  company.logoUrl ? 'hidden' : ''
                }`}
              >
                {getCompanyInitials(company.companyName)}
              </div>

              <div>
                <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{company.companyName}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    Location: {company.location}
                  </span>
                </div>
              </div>
            </div>

            {company.registrationUrl && (
              <a
                href={company.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm shadow-indigo-200 cursor-pointer self-stretch sm:self-center"
              >
                <span>REGISTER NOW</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* ROLES & COMPENSATION */}
          <div className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Roles & Compensation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {company.roles && company.roles.length > 0 ? (
                company.roles.map((r, index) => (
                  <div
                    key={index}
                    className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-1.5 hover:border-indigo-200 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base leading-snug">
                      <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{r.roleName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm sm:text-base pt-0.5">
                      <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{r.ctc}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                    <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{company.roleOffered || 'Software Engineer'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm sm:text-base">
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{company.package || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">About Opportunity</h3>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {company.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Placement Activities</h2>
              <p className="text-xs text-slate-500">All scheduled recruitment events in chronological order</p>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              {sortedEvents.length} Events
            </span>
          </div>

          {sortedEvents.length > 0 ? (
            <div className="space-y-4">
              {sortedEvents.map((evt) => (
                <div key={evt.eventId} className="relative">
                  <EventCard event={evt} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
              No placement activities scheduled yet for this company.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
