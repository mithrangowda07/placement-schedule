import type { PlacementEvent } from './event';

export interface Company {
  _id?: string;
  companyId: string;
  companyName: string;
  roleOffered?: string;
  logoUrl?: string;
  package: string;
  location: string;
  description: string;
  registrationUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyWithEvents extends Company {
  events: PlacementEvent[];
  nextEvent?: PlacementEvent;
}
