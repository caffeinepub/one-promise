/**
 * Date utilities for computing Mon-Sun week boundaries and stable per-day keys.
 */

/**
 * Get the Monday of the current week (Mon-Sun)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday is 0, Monday is 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the Sunday of the current week (Mon-Sun)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get a stable day key for a given date (YYYY-MM-DD format)
 * Standard calendar day, no reset logic
 */
export function getDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a day key that respects the 06:00 reset boundary.
 * If before 06:00, returns the previous calendar day's key.
 */
export function getDayKeyWithReset(date: Date): string {
  const hours = date.getHours();
  
  // If before 06:00, use previous calendar day
  if (hours < 6) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return getDayKey(yesterday);
  }
  
  return getDayKey(date);
}

/**
 * Check if a date is within the current Mon-Sun week
 */
export function isInCurrentWeek(date: Date): boolean {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  return date >= weekStart && date <= weekEnd;
}

/**
 * Format a date as a human-readable string (e.g., "Mon, Jan 1")
 */
export function formatDateHuman(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}
