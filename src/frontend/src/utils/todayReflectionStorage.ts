/**
 * Utility for persisting and retrieving today's reflection in browser storage.
 * Uses a day key that rolls over at 06:00 (not midnight) to align with the app's daily cycle.
 */

const STORAGE_KEY = 'today_reflection';
const STORAGE_DAY_KEY = 'today_reflection_day';

export type ReflectionOutcome = 'positive' | 'negative';

export interface TodayReflection {
  outcome: ReflectionOutcome;
  createdAt: string; // ISO date string
}

/**
 * Get the current day key based on 06:00 reset boundary
 * Days roll over at 06:00, not midnight
 */
function getCurrentDayKey(): string {
  const now = new Date();
  const hours = now.getHours();
  
  // If before 06:00, use previous calendar day
  if (hours < 6) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString();
  }
  
  return now.toDateString();
}

/**
 * Save today's reflection to localStorage
 * @throws Error if storage fails
 */
export function saveTodayReflection(outcome: ReflectionOutcome): void {
  try {
    const reflection: TodayReflection = {
      outcome,
      createdAt: new Date().toISOString(),
    };
    
    const dayKey = getCurrentDayKey();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reflection));
    localStorage.setItem(STORAGE_DAY_KEY, dayKey);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save reflection: ${error.message}`);
    }
    throw new Error('Failed to save reflection: Unknown error');
  }
}

/**
 * Get today's reflection from localStorage
 * Returns null if no reflection exists or if the reflection is from a previous day (before 06:00 boundary)
 */
export function getTodayReflection(): TodayReflection | null {
  try {
    const storedDayKey = localStorage.getItem(STORAGE_DAY_KEY);
    const currentDayKey = getCurrentDayKey();
    
    // Clear old reflection if it's from a previous day cycle
    if (storedDayKey !== currentDayKey) {
      clearTodayReflection();
      return null;
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored) as TodayReflection;
  } catch (error) {
    console.error('Error reading reflection from storage:', error);
    return null;
  }
}

/**
 * Clear today's reflection from localStorage
 */
export function clearTodayReflection(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_DAY_KEY);
  } catch (error) {
    console.error('Error clearing reflection from storage:', error);
  }
}
