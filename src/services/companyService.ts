import type { Company, CompanyWithEvents } from '../types/company';
import type { PlacementEvent } from '../types/event';
import { parseAsIST } from '../utils/dateUtils';

/**
 * Fetch all placement companies with their associated events from MongoDB API.
 */
export async function getCompaniesWithEvents(): Promise<CompanyWithEvents[]> {
  const res = await fetch('/api/companies');
  if (!res.ok) {
    throw new Error('Failed to fetch placement companies from MongoDB database');
  }

  const data = await res.json();
  if (!data || !data.success || !Array.isArray(data.companies)) {
    throw new Error('Invalid database response format');
  }

  return attachEventsToCompanies(data.companies, data.events || []);
}

/**
 * Helper to combine companies and events.
 */
function attachEventsToCompanies(companies: Company[], events: PlacementEvent[]): CompanyWithEvents[] {
  const nowMs = Date.now();

  return companies.map((comp) => {
    const compId = comp.companyId || comp._id;

    const compEvents = events
      .filter((e) => e.companyId === compId || e.companyId === comp.companyId || e.companyId === comp._id)
      .sort((a, b) => parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime());

    const upcomingEvents = compEvents.filter((e) => parseAsIST(e.dateTime).getTime() >= nowMs);
    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : undefined;

    return {
      ...comp,
      companyId: compId || comp.companyName.toLowerCase().replace(/\s+/g, '-'),
      events: compEvents,
      nextEvent,
    };
  });
}

/**
 * Get single company with details and events by ID from MongoDB API.
 */
export async function getCompanyById(id: string): Promise<CompanyWithEvents | null> {
  const res = await fetch(`/api/company?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    // If exact ID route fails, query all companies list
    const all = await getCompaniesWithEvents();
    const found = all.find((c) => c.companyId === id || c._id === id);
    return found || null;
  }

  const data = await res.json();
  if (data && data.success && data.company) {
    const events: PlacementEvent[] = data.events || [];
    const comp = data.company as Company;
    const compEvents = events.sort(
      (a, b) => parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime()
    );

    const nowMs = Date.now();
    const upcomingEvents = compEvents.filter((e) => parseAsIST(e.dateTime).getTime() >= nowMs);

    return {
      ...comp,
      companyId: comp.companyId || comp._id || id,
      events: compEvents,
      nextEvent: upcomingEvents[0],
    };
  }

  return null;
}

/**
 * Add a new company and its events to MongoDB via Admin API.
 */
export async function saveCompanyWithEvents(
  companyData: Omit<Company, 'companyId' | 'createdAt' | 'updatedAt'>,
  eventsData: Omit<PlacementEvent, 'eventId' | 'companyId' | 'createdAt' | 'updatedAt'>[]
): Promise<CompanyWithEvents> {
  const token = localStorage.getItem('rvce_placement_admin_token') || '';

  const res = await fetch('/api/admin/companies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ company: companyData, events: eventsData }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to save company in MongoDB');
  }

  const data = await res.json();
  return data.company as CompanyWithEvents;
}

/**
 * Update an existing company and replace its events in MongoDB via Admin API.
 */
export async function updateCompanyWithEvents(
  companyId: string,
  companyData: Omit<Company, 'companyId' | 'createdAt' | 'updatedAt'>,
  eventsData: Omit<PlacementEvent, 'eventId' | 'companyId' | 'createdAt' | 'updatedAt'>[]
): Promise<CompanyWithEvents> {
  const token = localStorage.getItem('rvce_placement_admin_token') || '';

  const res = await fetch(`/api/admin/companies?id=${encodeURIComponent(companyId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ company: companyData, events: eventsData }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to update company in MongoDB');
  }

  const updated = await getCompanyById(companyId);
  if (!updated) {
    throw new Error('Updated company not found');
  }
  return updated;
}

/**
 * Delete a company and all its associated events from MongoDB via Admin API.
 */
export async function deleteCompany(companyId: string): Promise<boolean> {
  const token = localStorage.getItem('rvce_placement_admin_token') || '';

  const res = await fetch(`/api/admin/companies?id=${encodeURIComponent(companyId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to delete company from MongoDB');
  }

  return true;
}
