import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import type { Company, CompanyWithEvents } from '../types/company';
import type { PlacementEvent, EventType } from '../types/event';
import { EVENT_TYPE_LABELS } from '../types/event';
import { buildISTDateTime } from '../utils/dateUtils';

export interface FormEventItem {
  eventId?: string;
  eventType: EventType;
  title: string;
  date: string;
  time: string;
  url: string;
  description: string;
}

interface CompanyFormProps {
  initialData?: CompanyWithEvents;
  onSubmit: (
    companyData: Omit<Company, 'companyId' | 'createdAt' | 'updatedAt'>,
    eventsData: Omit<PlacementEvent, 'eventId' | 'companyId' | 'createdAt' | 'updatedAt'>[]
  ) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onSubmit, onCancel, isEdit = false }) => {
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [roleOffered, setRoleOffered] = useState(initialData?.roleOffered || '');
  const [pkg, setPkg] = useState(initialData?.package || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [registrationUrl, setRegistrationUrl] = useState(initialData?.registrationUrl || '');

  const [events, setEvents] = useState<FormEventItem[]>(
    initialData?.events?.map((e) => ({
      eventId: e.eventId,
      eventType: e.eventType,
      title: e.title || '',
      date: e.date || '',
      time: e.time || '10:00',
      url: e.url || '',
      description: e.description || '',
    })) || []
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAddEvent = () => {
    const defaultDate = new Date().toISOString().split('T')[0];
    setEvents([
      ...events,
      {
        eventType: 'COMPANY_REGISTRATION',
        title: 'Company Registration',
        date: defaultDate,
        time: '',
        url: '',
        description: '',
      },
    ]);
  };

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, idx) => idx !== index));
  };

  const handleEventChange = (index: number, field: keyof FormEventItem, value: string) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'eventType') {
      const newType = value as EventType;
      if (newType !== 'OTHER') {
        updated[index].title = EVENT_TYPE_LABELS[newType];
      } else if (updated[index].title === EVENT_TYPE_LABELS['COMPANY_REGISTRATION']) {
        updated[index].title = '';
      }
    }

    setEvents(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Company Name is required.');
      return;
    }
    if (!pkg.trim()) {
      setError('Package amount is required.');
      return;
    }
    if (!location.trim()) {
      setError('Location is required.');
      return;
    }

    for (let i = 0; i < events.length; i++) {
      const evt = events[i];
      if (evt.eventType === 'OTHER' && !evt.title.trim()) {
        setError(`Event #${i + 1} has type 'Other'. A custom Title is required.`);
        return;
      }
      if (!evt.date) {
        setError(`Event #${i + 1} requires a Date.`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const formattedEvents: Omit<PlacementEvent, 'eventId' | 'companyId' | 'createdAt' | 'updatedAt'>[] = events.map(
        (evt) => {
          const dateTime = buildISTDateTime(evt.date, evt.time);
          return {
            eventType: evt.eventType,
            title: evt.eventType === 'OTHER' ? evt.title : EVENT_TYPE_LABELS[evt.eventType],
            date: evt.date,
            time: evt.time || undefined,
            dateTime,
            url: evt.url.trim() || undefined,
            description: evt.description.trim() || undefined,
          };
        }
      );

      const companyPayload = {
        companyName: companyName.trim(),
        roleOffered: roleOffered.trim() || undefined,
        package: pkg.trim(),
        location: location.trim(),
        logoUrl: logoUrl.trim() || undefined,
        description: description.trim(),
        registrationUrl: registrationUrl.trim() || undefined,
      };

      await onSubmit(
        companyPayload,
        formattedEvents
      );
    } catch {
      setError('Failed to save company information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-center gap-3 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* COMPANY DETAILS CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
          1. Company Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Package *
            </label>
            <input
              type="text"
              required
              value={pkg}
              onChange={(e) => setPkg(e.target.value)}
              placeholder="e.g. 15 LPA"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Offered (Optional)
            </label>
            <input
              type="text"
              value={roleOffered}
              onChange={(e) => setRoleOffered(e.target.value)}
              placeholder="e.g. Software Development Engineer (SDE-1)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Location *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bangalore"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Logo URL (Optional)
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Registration URL (Optional)
          </label>
          <input
            type="url"
            value={registrationUrl}
            onChange={(e) => setRegistrationUrl(e.target.value)}
            placeholder="https://forms.gle/registration-link"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of software engineering opportunities, eligibility, and roles..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* EVENTS BUILDER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">2. Placement Activities & Events</h2>
            <p className="text-xs text-slate-500">Schedule registration deadlines, online tests, PPT, and interviews</p>
          </div>

          <button
            type="button"
            onClick={handleAddEvent}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD EVENT</span>
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200 space-y-3">
            <p className="text-sm font-semibold text-slate-700">No events added yet.</p>
            <button
              type="button"
              onClick={handleAddEvent}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-colors"
            >
              + ADD FIRST EVENT
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((evt, index) => (
              <div
                key={index}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4 relative"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                    Event #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvent(index)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 p-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>REMOVE</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Event Type *
                    </label>
                    <select
                      value={evt.eventType}
                      onChange={(e) => handleEventChange(index, 'eventType', e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="COMPANY_REGISTRATION">Company Registration</option>
                      <option value="PORTAL_REGISTRATION">Company Portal Registration</option>
                      <option value="ONLINE_ASSESSMENT">Online Assessment</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {evt.eventType === 'OTHER' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={evt.title}
                        onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                        placeholder="e.g. Pre Placement Talk"
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Date (IST) *
                    </label>
                    <input
                      type="date"
                      required
                      value={evt.date}
                      onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Time (IST) (Optional)
                    </label>
                    <input
                      type="time"
                      value={evt.time}
                      onChange={(e) => handleEventChange(index, 'time', e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Event URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={evt.url}
                      onChange={(e) => handleEventChange(index, 'url', e.target.value)}
                      placeholder="https://example.com/test-link"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Event Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={evt.description}
                      onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                      placeholder="e.g. Bring official college ID card & updated resume."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORM ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
        >
          CANCEL
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'SAVING COMPANY...' : isEdit ? 'UPDATE COMPANY' : 'SAVE COMPANY'}</span>
        </button>
      </div>
    </form>
  );
};
