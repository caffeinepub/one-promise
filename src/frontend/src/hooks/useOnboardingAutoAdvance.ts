import { useEffect, useRef } from 'react';

interface UseOnboardingAutoAdvanceProps {
  currentSlide: number;
  onAdvance: (nextSlide: number) => void;
  enabled: boolean;
}

/**
 * Hook that manages the onboarding carousel auto-advance schedule.
 * Advances slides every 5 seconds when enabled.
 * Cleans up timers properly to prevent stacking during manual navigation.
 */
export function useOnboardingAutoAdvance({
  currentSlide,
  onAdvance,
  enabled,
}: UseOnboardingAutoAdvanceProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Only auto-advance if enabled
    if (!enabled) {
      return;
    }

    // Schedule advance after 5 seconds
    timerRef.current = setTimeout(() => {
      onAdvance(currentSlide + 1);
    }, 5000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentSlide, enabled, onAdvance]);
}
