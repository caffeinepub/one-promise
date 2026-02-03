/**
 * Frontend-only localStorage utilities for journal history.
 * Stores per-day promise + optional reflection outcome for weekly aggregation.
 */

import { getDayKey, getDayKeyWithReset } from './weekUtils';
import { normalizeOutcome, isValidOutcome, type ReflectionOutcome } from './outcomeMapping';

const HISTORY_STORAGE_KEY = 'journal_history';
const REPAIR_VERSION_KEY = 'journal_repair_v1';

export interface JournalEntry {
  dayKey: string; // YYYY-MM-DD
  date: string; // ISO date string
  promise: string;
  outcome?: ReflectionOutcome; // undefined means no reflection yet
}

/**
 * Get all journal history entries
 */
export function getJournalHistory(): JournalEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as JournalEntry[];
  } catch (error) {
    console.error('Error reading journal history:', error);
    return [];
  }
}

/**
 * Save or update a journal entry for a specific day
 */
export function saveJournalEntry(promise: string, outcome?: ReflectionOutcome): void {
  try {
    const now = new Date();
    const dayKey = getDayKeyWithReset(now);
    const history = getJournalHistory();
    
    // Find existing entry for today
    const existingIndex = history.findIndex(entry => entry.dayKey === dayKey);
    
    const entry: JournalEntry = {
      dayKey,
      date: now.toISOString(),
      promise,
      outcome: outcome ? normalizeOutcome(outcome) : undefined,
    };
    
    if (existingIndex >= 0) {
      // Update existing entry
      history[existingIndex] = entry;
    } else {
      // Add new entry
      history.push(entry);
    }
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving journal entry:', error);
  }
}

/**
 * Update the outcome for today's entry
 */
export function updateTodayOutcome(outcome: ReflectionOutcome): void {
  try {
    const dayKey = getDayKeyWithReset(new Date());
    const history = getJournalHistory();
    
    const entry = history.find(e => e.dayKey === dayKey);
    if (entry) {
      // Validate and normalize the outcome before saving
      const normalizedOutcome = normalizeOutcome(outcome);
      entry.outcome = normalizedOutcome;
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } else {
      console.error('No journal entry found for today to update outcome');
    }
  } catch (error) {
    console.error('Error updating outcome:', error);
  }
}

/**
 * Get entries for the current Mon-Sun week
 */
export function getWeekEntries(): JournalEntry[] {
  const history = getJournalHistory();
  const now = new Date();
  
  // Calculate Monday of current week
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  // Calculate Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return history.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= monday && entryDate <= sunday;
  });
}

/**
 * Get history entries sorted by date (most recent first)
 */
export function getHistorySorted(): JournalEntry[] {
  const history = getJournalHistory();
  return history.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Clear all journal history (for logout)
 */
export function clearJournalHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    localStorage.removeItem(REPAIR_VERSION_KEY);
  } catch (error) {
    console.error('Error clearing journal history:', error);
  }
}

/**
 * Remove only today's journal entry (for testing reset)
 */
export function removeTodayEntry(): void {
  try {
    const dayKey = getDayKeyWithReset(new Date());
    const history = getJournalHistory();
    const filtered = history.filter(entry => entry.dayKey !== dayKey);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing today entry:', error);
  }
}

/**
 * Best-effort repair routine for history entries with invalid outcomes.
 * This is idempotent and only normalizes entries with invalid outcome values.
 * Runs once per repair version.
 */
export function repairHistoryIfNeeded(): void {
  try {
    // Check if repair has already been run for this version
    const repairDone = localStorage.getItem(REPAIR_VERSION_KEY);
    if (repairDone === 'true') {
      return;
    }
    
    const history = getJournalHistory();
    let repairCount = 0;
    
    // Normalize any invalid outcomes
    const repairedHistory = history.map(entry => {
      if (entry.outcome !== undefined && !isValidOutcome(entry.outcome)) {
        repairCount++;
        console.warn(`Repairing invalid outcome for entry ${entry.dayKey}:`, entry.outcome);
        return {
          ...entry,
          outcome: normalizeOutcome(entry.outcome),
        };
      }
      return entry;
    });
    
    if (repairCount > 0) {
      console.log(`Repaired ${repairCount} journal entries with invalid outcomes`);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(repairedHistory));
    }
    
    // Mark repair as complete
    localStorage.setItem(REPAIR_VERSION_KEY, 'true');
  } catch (error) {
    console.error('Error during history repair:', error);
  }
}
