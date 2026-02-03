import { useState, useEffect } from 'react';

const SUGGESTIONS = [
  'Drink more water',
  'Stop scrolling by 8pm',
  'Go for a walk',
  'Hit the gym',
  'Call granny',
  'Move for 2 minutes every hour',
  'Stretch for 5 minutes',
  'Clear my email inbox',
  'Tidy my desk',
  'Compliment a stranger',
  'Read 2 chapters of my book',
  'No snacks today',
];

const DISPLAY_DURATION = 3000; // Show each suggestion for 3 seconds
const FADE_OUT_DURATION = 500; // Fade out over 0.5 seconds
const FADE_IN_DURATION = 500; // Fade in over 0.5 seconds

export function useRotatingPromiseSuggestions() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start fade out
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, DISPLAY_DURATION);

    // Change text and start fade in
    const changeTextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % SUGGESTIONS.length);
      setIsVisible(true);
    }, DISPLAY_DURATION + FADE_OUT_DURATION);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(changeTextTimer);
    };
  }, [currentIndex]);

  return {
    currentSuggestion: SUGGESTIONS[currentIndex],
    isVisible,
  };
}
