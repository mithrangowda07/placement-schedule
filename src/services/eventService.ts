import type { PlacementEvent } from '../types/event';
import { getCompaniesWithEvents } from './companyService';
import { parseAsIST } from '../utils/dateUtils';

export interface EventWithCompany extends PlacementEvent {
  companyName: string;
  companyPackage: string;
  companyLocation: string;
  companyLogoUrl?: string;
}

/**
 * Get all upcoming placement activities across all companies, sorted chronologically.
 */
export async function getAllUpcomingEvents(): Promise<EventWithCompany[]> {
  const companies = await getCompaniesWithEvents();
  const nowMs = Date.now();

  const allEvents: EventWithCompany[] = [];

  for (const company of companies) {
    for (const evt of company.events) {
      const evtMs = parseAsIST(evt.dateTime).getTime();
      if (evtMs >= nowMs - 24 * 60 * 60 * 1000) {
        allEvents.push({
          ...evt,
          companyName: company.companyName,
          companyPackage: company.roles && company.roles.length > 0 ? company.roles[0].ctc : company.package || 'N/A',
          companyLocation: company.location,
          companyLogoUrl: company.logoUrl,
        });
      }
    }
  }

  return allEvents.sort((a, b) => parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime());
}
