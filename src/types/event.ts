export type EventType =
  | 'COMPANY_REGISTRATION'
  | 'PORTAL_REGISTRATION'
  | 'ONLINE_ASSESSMENT'
  | 'INTERVIEW'
  | 'OTHER';

export interface PlacementEvent {
  _id?: string;
  eventId: string;
  companyId: string;
  eventType: EventType;
  title: string;
  date: string;       // YYYY-MM-DD
  time?: string;      // HH:mm (Optional)
  dateTime: string;   // ISO 8601 string with IST offset (+05:30)
  url?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  COMPANY_REGISTRATION: 'Company Registration',
  PORTAL_REGISTRATION: 'Company Portal Registration',
  ONLINE_ASSESSMENT: 'Online Assessment',
  INTERVIEW: 'Interview',
  OTHER: 'Other Event',
};

export const EVENT_TYPE_BUTTON_TEXT: Record<EventType, string> = {
  COMPANY_REGISTRATION: 'REGISTER NOW',
  PORTAL_REGISTRATION: 'OPEN PORTAL',
  ONLINE_ASSESSMENT: 'OPEN ASSESSMENT',
  INTERVIEW: 'VIEW DETAILS',
  OTHER: 'VIEW EVENT',
};
