import type { PlacementEvent } from './event';

export interface CompanyRole {
  roleName: string;
  ctc: string;
}

export interface Company {
  _id?: string;
  companyId: string;
  companyName: string;
  roles: CompanyRole[];
  logoUrl?: string;
  location: string;
  description: string;
  registrationUrl?: string;
  createdAt?: string;
  updatedAt?: string;

  // Optional backward compatibility fields
  roleOffered?: string;
  package?: string;
}

export interface CompanyWithEvents extends Company {
  events: PlacementEvent[];
  nextEvent?: PlacementEvent;
}

export function normalizeCompanyRoles(company: Partial<Company>): CompanyRole[] {
  if (Array.isArray(company.roles) && company.roles.length > 0) {
    return company.roles;
  }
  if (company.roleOffered || company.package) {
    return [
      {
        roleName: company.roleOffered || 'Software Engineer',
        ctc: company.package || 'N/A',
      },
    ];
  }
  return [];
}

