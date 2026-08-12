import type { PlacementEvent } from '../types/event';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30 in ms

/**
 * Returns current Date in IST.
 */
export function getNowIST(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + IST_OFFSET_MS);
}

/**
 * Constructs an ISO string with +05:30 offset from YYYY-MM-DD and optional HH:mm.
 */
export function buildISTDateTime(date: string, time?: string): string {
  if (!time || !time.trim()) {
    return `${date}T00:00:00+05:30`;
  }
  const safeTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${safeTime}+05:30`;
}

/**
 * Parses an ISO date string into a Date object normalized to IST components.
 */
export function parseAsIST(dateTimeStr: string): Date {
  const d = new Date(dateTimeStr);
  if (isNaN(d.getTime())) return new Date();
  return d;
}

/**
 * Gets midnight IST timestamp for a given date.
 */
function getStartOfDayIST(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  return Date.UTC(y, m, d) - IST_OFFSET_MS;
}

export type EventTimingStatus = 'TODAY' | 'TOMORROW' | 'FUTURE' | 'PAST';

/**
 * Categorizes an event's dateTime relative to current IST time.
 */
export function getEventTimingStatus(dateTimeStr: string): EventTimingStatus {
  const eventDate = parseAsIST(dateTimeStr);
  const nowIST = getNowIST();

  const eventTimeMs = eventDate.getTime();
  const nowMs = nowIST.getTime();

  const todayStart = getStartOfDayIST(nowIST);
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1;
  const tomorrowEnd = todayEnd + 24 * 60 * 60 * 1000;

  if (eventTimeMs < nowMs && eventTimeMs < todayStart) {
    return 'PAST';
  }

  if (eventTimeMs >= todayStart && eventTimeMs <= todayEnd) {
    return 'TODAY';
  }

  if (eventTimeMs > todayEnd && eventTimeMs <= tomorrowEnd) {
    return 'TOMORROW';
  }

  if (eventTimeMs > tomorrowEnd) {
    return 'FUTURE';
  }

  return 'PAST';
}

/**
 * Formats time from HH:mm or ISO string to 12-hour format with AM/PM (e.g. 6:00 PM).
 * Returns empty string if time is not specified.
 */
export function formatTime12H(timeStr?: string): string {
  if (!timeStr || !timeStr.trim()) return '';
  let hours = 0;
  let minutes = 0;

  if (timeStr.includes('T')) {
    const d = parseAsIST(timeStr);
    const istDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000 + IST_OFFSET_MS);
    hours = istDate.getHours();
    minutes = istDate.getMinutes();
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

/**
 * Formats YYYY-MM-DD or ISO string to Date/Month/Year format (e.g. "15/08/2026").
 */
export function formatDateFriendly(dateStr: string): string {
  if (!dateStr) return '';

  let year = 2026;
  let month = 8;
  let day = 15;

  if (dateStr.includes('T')) {
    const d = parseAsIST(dateStr);
    const istDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000 + IST_OFFSET_MS);
    year = istDate.getFullYear();
    month = istDate.getMonth() + 1;
    day = istDate.getDate();
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
 * Uses DD/MM/YYYY date format and appends 12-hour time if present.
 */
export function formatEventDateTime(event: PlacementEvent): string {
  const status = getEventTimingStatus(event.dateTime);
  const timeFormatted = event.time ? formatTime12H(event.time) : '';
  const dateFormatted = formatDateFriendly(event.date || event.dateTime);

  if (status === 'TODAY') {
    return timeFormatted ? `Today • ${timeFormatted}` : 'Today';
  }

  if (status === 'TOMORROW') {
    return timeFormatted ? `Tomorrow • ${timeFormatted}` : 'Tomorrow';
  }

  return timeFormatted ? `${dateFormatted} • ${timeFormatted}` : dateFormatted;
}

/**
 * Filters and sorts events into upcoming list.
 */
export function getUpcomingEvents(events: PlacementEvent[]): PlacementEvent[] {
  const nowMs = getNowIST().getTime();

  return events
    .filter((evt) => {
      const evtMs = parseAsIST(evt.dateTime).getTime();
      return evtMs >= nowMs;
    })
    .sort((a, b) => parseAsIST(a.dateTime).getTime() - parseAsIST(b.dateTime).getTime());
}

/**
 * Checks if event is happening within 7 days from now (in IST).
 */
export function isEventThisWeek(dateTimeStr: string): boolean {
  const eventMs = parseAsIST(dateTimeStr).getTime();
  const nowIST = getNowIST();

  const todayStart = getStartOfDayIST(nowIST);
  const weekEnd = todayStart + 7 * 24 * 60 * 60 * 1000;

  return eventMs >= todayStart && eventMs <= weekEnd;
}
