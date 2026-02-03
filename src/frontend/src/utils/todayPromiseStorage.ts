/**
 * Utility for persisting and retrieving today's promise in browser storage.
 * Uses localStorage with error handling for quota exceeded and other storage failures.
 */

const STORAGE_KEY = 'today_promise';
const STORAGE_DATE_KEY = 'today_promise_date';

export interface TodayPromise {
  text: string;
  createdAt: string; // ISO date string
}

/**
 * Save today's promise to localStorage
 * @throws Error if storage fails
 */
export function saveTodayPromise(promiseText: string): void {
  try {
    const promise: TodayPromise = {
      text: promiseText.trim(),
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(promise));
    localStorage.setItem(STORAGE_DATE_KEY, new Date().toDateString());
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save promise: ${error.message}`);
    }
    throw new Error('Failed to save promise: Unknown error');
  }
}

/**
 * Get today's promise from localStorage
 * Returns null if no promise exists or if the promise is from a previous day
 */
export function getTodayPromise(): TodayPromise | null {
  try {
    const storedDate = localStorage.getItem(STORAGE_DATE_KEY);
    const today = new Date().toDateString();
    
    // Clear old promise if it's from a previous day
    if (storedDate !== today) {
      clearTodayPromise();
      return null;
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored) as TodayPromise;
  } catch (error) {
    console.error('Error reading promise from storage:', error);
    return null;
  }
}

/**
 * Clear today's promise from localStorage
 */
export function clearTodayPromise(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_DATE_KEY);
  } catch (error) {
    console.error('Error clearing promise from storage:', error);
  }
}
