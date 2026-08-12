import type { PlacementEvent } from '../types/event';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30 in ms

/**
 * Returns YYYY-MM-DD date string in IST (Asia/Kolkata) for any timestamp/Date input.
 * Timezone-independent.
 */
export function getISTDateString(dateInput?: Date | number | string): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

/**
 * Returns tomorrow's YYYY-MM-DD date string in IST (Asia/Kolkata).
 */
export function getISTTomorrowDateString(refMs: number = Date.now()): string {
  const todayStr = getISTDateString(refMs);
  const parts = todayStr.split('-').map((v) => parseInt(v, 10));
  if (parts.length < 3) return '';
  const [year, month, day] = parts;
  const tomorrowDate = new Date(Date.UTC(year, month - 1, day + 1));
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(tomorrowDate);
}

/**
 * Returns current Date object in IST timezone.
 */
export function getNowIST(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + IST_OFFSET_MS);
}

/**
 * Constructs an ISO 8601 string with +05:30 offset from YYYY-MM-DD and optional HH:mm.
 */
export function buildISTDateTime(date: string, time?: string): string {
  if (!time || !time.trim()) {
    return `${date}T00:00:00+05:30`;
  }
  const safeTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${safeTime}+05:30`;
}

/**
 * Parses an ISO date string or Date input into a valid Date object.
 */
export function parseAsIST(dateTimeStr?: string | Date): Date {
  if (!dateTimeStr) return new Date();
  const d = typeof dateTimeStr === 'string' ? new Date(dateTimeStr) : dateTimeStr;
  if (isNaN(d.getTime())) return new Date();
  return d;
}

export type EventTimingStatus = 'TODAY' | 'TOMORROW' | 'FUTURE' | 'PAST';

/**
 * Categorizes an event's timing strictly based on its scheduled eventDateTime / event.date in IST.
 * NEVER uses createdAt or updatedAt metadata.
 */
export function getEventTimingStatus(dateTimeStr?: string, dateStr?: string): EventTimingStatus {
  if (!dateTimeStr) return 'PAST';

  const eventMs = new Date(dateTimeStr).getTime();
  if (isNaN(eventMs)) return 'PAST';

  const currentMs = Date.now();
  const todayIST = getISTDateString(currentMs);
  const tomorrowIST = getISTTomorrowDateString(currentMs);
  const eventIST = dateStr || getISTDateString(dateTimeStr);

  if (eventIST === todayIST) {
    return 'TODAY';
  }

  if (eventIST === tomorrowIST) {
    return 'TOMORROW';
  }

  if (eventMs < currentMs && eventIST < todayIST) {
    return 'PAST';
  }

  if (eventMs >= currentMs || eventIST > tomorrowIST) {
    return 'FUTURE';
  }

  return 'PAST';
}

/**
 * Formats time from HH:mm or ISO string to 12-hour format with AM/PM (e.g. 6:00 PM).
 */
export function formatTime12H(timeStr?: string): string {
  if (!timeStr || !timeStr.trim()) return '';
  let hours = 0;
  let minutes = 0;

  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return '';
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(d);

    parts.forEach((p) => {
      if (p.type === 'hour') hours = parseInt(p.value, 10);
      if (p.type === 'minute') minutes = parseInt(p.value, 10);
    });
  } else {
    const parts = timeStr.split(':');
    if (parts.length < 2) return '';
    hours = parseInt(parts[0], 10) || 0;
    minutes = parseInt(parts[1], 10) || 0;
  }

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${displayHours}:${displayMinutes} ${ampm}`;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats YYYY-MM-DD or ISO string to compact date format (e.g. "18 Aug").
 */
export function formatDateCompact(dateStr: string): string {
  if (!dateStr) return '';
  let day = 1;
  let monthIndex = 0;

  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'numeric',
      }).formatToParts(d);
      parts.forEach((p) => {
        if (p.type === 'day') day = parseInt(p.value, 10);
        if (p.type === 'month') monthIndex = parseInt(p.value, 10) - 1;
      });
    }
  } else {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      monthIndex = (parseInt(parts[1], 10) || 1) - 1;
      day = parseInt(parts[2], 10) || 1;
    }
  }

  const monthName = MONTHS_SHORT[monthIndex] || '';
  return `${day} ${monthName}`.trim();
}

/**
 * Formats YYYY-MM-DD or ISO string to Date/Month/Year format (e.g. "15/08/2026").
 */
export function formatDateFriendly(dateStr: string): string {
  if (!dateStr) return '';

  let year = 2026;
  let month = 8;
  let day = 15;

  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).formatToParts(d);
      parts.forEach((p) => {
        if (p.type === 'year') year = parseInt(p.value, 10);
        if (p.type === 'month') month = parseInt(p.value, 10);
        if (p.type === 'day') day = parseInt(p.value, 10);
      });
    }
  } else {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }
  }

  const dd = day < 10 ? `0${day}` : `${day}`;
  const mm = month < 10 ? `0${month}` : `${month}`;
  return `${dd}/${mm}/${year}`;
}

/**
 * Formats event date/time for display on cards and timelines.
 * Displays "Today • 6:00 PM", "Tomorrow • 10:00 AM", or "18/08/2026 • 2:00 PM".
 */
export function formatEventDateTime(event: PlacementEvent): string {
  const status = getEventTimingStatus(event.dateTime, event.date);
  const timeFormatted = event.time ? formatTime12H(event.time) : '';
  const dateCompact = formatDateCompact(event.date || event.dateTime);

  if (status === 'TODAY') {
    return timeFormatted ? `Today • ${timeFormatted}` : 'Today';
  }

  if (status === 'TOMORROW') {
    return timeFormatted ? `Tomorrow • ${timeFormatted}` : 'Tomorrow';
  }

  return timeFormatted ? `${dateCompact} • ${timeFormatted}` : dateCompact;
}

/**
 * Calculates priority score for sorting placement events based on urgency:
 * 1. Registration closing today
 * 2. Registration closing tomorrow
 * 3. Assessment today
 * 4. Interview today
 * 5. Other events today
 * 6. Assessment tomorrow
 * 7. Interview tomorrow
 * 8. Other events tomorrow
 * 9. Upcoming events
 * 10. Past events
 */
export function getEventPriorityScore(event: PlacementEvent): number {
  const status = getEventTimingStatus(event.dateTime, event.date);
  const isRegistration = event.eventType === 'COMPANY_REGISTRATION' || event.eventType === 'PORTAL_REGISTRATION';

  if (status === 'TODAY' && isRegistration) return 1;
  if (status === 'TOMORROW' && isRegistration) return 2;
  if (status === 'TODAY' && event.eventType === 'ONLINE_ASSESSMENT') return 3;
  if (status === 'TODAY' && event.eventType === 'INTERVIEW') return 4;
  if (status === 'TODAY') return 5;
  if (status === 'TOMORROW' && event.eventType === 'ONLINE_ASSESSMENT') return 6;
  if (status === 'TOMORROW' && event.eventType === 'INTERVIEW') return 7;
  if (status === 'TOMORROW') return 8;
  if (status === 'FUTURE') return 9;

  return 10;
}

/**
 * Filters and sorts events into upcoming list based strictly on eventDateTime.
 * NEVER uses createdAt or updatedAt.
 */
export function getUpcomingEvents(events: PlacementEvent[]): PlacementEvent[] {
  const currentMs = Date.now();
  const todayIST = getISTDateString(currentMs);

  return events
    .filter((evt) => {
      const evtMs = new Date(evt.dateTime).getTime();
      const evtIST = evt.date || getISTDateString(evt.dateTime);
      return evtMs >= currentMs || evtIST >= todayIST;
    })
    .sort((a, b) => {
      const prioA = getEventPriorityScore(a);
      const prioB = getEventPriorityScore(b);
      if (prioA !== prioB) return prioA - prioB;
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });
}

/**
 * Checks if event falls within the current Monday → Sunday week in IST.
 * NEVER uses createdAt or updatedAt.
 */
export function isEventThisWeek(dateTimeStr?: string, dateStr?: string): boolean {
  if (!dateTimeStr && !dateStr) return false;

  const refMs = Date.now();
  const todayStr = getISTDateString(refMs);
  const parts = todayStr.split('-').map((v) => parseInt(v, 10));
  if (parts.length < 3) return false;

  const [year, month, day] = parts;
  const currentISTDate = new Date(Date.UTC(year, month - 1, day));

  // Determine weekday in IST (0 = Mon, ..., 6 = Sun)
  const weekdayStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(new Date(refMs));

  const daysOfWeekMap: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const dayIdx = daysOfWeekMap[weekdayStr] ?? 0;

  // Monday 00:00:00 IST of current week
  const mondayDate = new Date(currentISTDate);
  mondayDate.setUTCDate(currentISTDate.getUTCDate() - dayIdx);
  const monStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(mondayDate);

  // Sunday 23:59:59 IST of current week
  const sundayDate = new Date(mondayDate);
  sundayDate.setUTCDate(mondayDate.getUTCDate() + 6);
  const sunStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(sundayDate);

  const startMs = new Date(`${monStr}T00:00:00+05:30`).getTime();
  const endMs = new Date(`${sunStr}T23:59:59.999+05:30`).getTime();

  const eventMs = dateTimeStr ? new Date(dateTimeStr).getTime() : 0;
  const eventIST = dateStr || (dateTimeStr ? getISTDateString(dateTimeStr) : '');

  if (eventIST && eventIST >= monStr && eventIST <= sunStr) {
    return true;
  }

  return eventMs >= startMs && eventMs <= endMs;
}
