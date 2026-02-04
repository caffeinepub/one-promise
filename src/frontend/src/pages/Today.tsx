import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useRotatingPromiseSuggestions } from '../hooks/useRotatingPromiseSuggestions';
import { saveTodayPromise, getTodayPromise, clearTodayPromise } from '../utils/todayPromiseStorage';
import {
  saveTodayReflection,
  getTodayReflection,
  clearTodayReflection,
  type ReflectionOutcome,
} from '../utils/todayReflectionStorage';
import { saveJournalEntry, removeTodayEntry } from '../utils/journalHistoryStorage';
import { ThumbsUpIcon, ThumbsDownIcon } from '../components/icons';
import JournalSlideOutPanel from '../components/JournalSlideOutPanel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Menu } from 'lucide-react';
import { setPostLogoutFlag } from '../utils/onboardingEntry';
import { attemptNotificationPermissionRequest } from '../utils/notificationPermission';

type AppState = 'create' | 'confirm' | 'reflect' | 'rest';

export default function Today() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [appState, setAppState] = useState<AppState>('create');
  const [promiseText, setPromiseText] = useState('');
  const [reflectionOutcome, setReflectionOutcome] = useState<ReflectionOutcome | null>(null);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { currentSuggestion, isVisible } = useRotatingPromiseSuggestions();

  // Set up gesture-safe notification permission request on mount
  useEffect(() => {
    let handled = false;

    const handleGesture = async () => {
      if (handled) return;
      handled = true;

      // Attempt the permission request in this gesture context
      await attemptNotificationPermissionRequest();

      // Clean up all listeners after first attempt
      document.removeEventListener('pointerdown', handleGesture);
      document.removeEventListener('touchstart', handleGesture);
      document.removeEventListener('click', handleGesture);
      document.removeEventListener('keydown', handleGesture);
    };

    // Register listeners for qualifying user interactions
    document.addEventListener('pointerdown', handleGesture, { once: false });
    document.addEventListener('touchstart', handleGesture, { once: false });
    document.addEventListener('click', handleGesture, { once: false });
    document.addEventListener('keydown', handleGesture, { once: false });

    // Cleanup on unmount
    return () => {
      document.removeEventListener('pointerdown', handleGesture);
      document.removeEventListener('touchstart', handleGesture);
      document.removeEventListener('click', handleGesture);
      document.removeEventListener('keydown', handleGesture);
    };
  }, []);

  // Load saved state on mount
  useEffect(() => {
    const savedPromise = getTodayPromise();
    const savedReflection = getTodayReflection();

    if (savedReflection) {
      setReflectionOutcome(savedReflection.outcome);
      setAppState('rest');
    } else if (savedPromise) {
      setPromiseText(savedPromise.text);
      setAppState('reflect');
    } else {
      setAppState('create');
    }
  }, []);

  // Auto-focus textarea when in create state
  useEffect(() => {
    if (appState === 'create' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [appState]);

  const handleCreatePromise = () => {
    if (promiseText.trim()) {
      saveTodayPromise(promiseText.trim());
      setAppState('confirm');
    }
  };

  const handleConfirmPromise = () => {
    setAppState('reflect');
  };

  const handleReflection = (outcome: ReflectionOutcome) => {
    setReflectionOutcome(outcome);
    saveTodayReflection(outcome);
    saveJournalEntry(promiseText, outcome);
    setAppState('rest');
  };

  const handleLogout = async () => {
    // Set flag so user sees logged-out screen after logout
    setPostLogoutFlag();
    await clear();
    queryClient.clear();
  };

  const handleResetToday = () => {
    // Clear today's promise and reflection from storage
    clearTodayPromise();
    clearTodayReflection();
    // Remove today's journal entry
    removeTodayEntry();
    // Reset component state
    setPromiseText('');
    setReflectionOutcome(null);
    setAppState('create');
  };

  // Create State
  if (appState === 'create') {
    return (
      <div className="min-h-screen bg-[#F2F5F7] flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-6 flex items-center justify-between">
          <h1
            className="font-serif text-3xl text-[#2C2C2C] tracking-tight cursor-pointer select-none"
            onClick={() => setIsJournalOpen(true)}
          >
            TODAY
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsJournalOpen(true)}
            className="text-[#2C2C2C] hover:bg-[#2C2C2C]/5"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 pb-24">
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl md:text-3xl text-[#2C2C2C]/80 font-light">
                What's your promise today?
              </h2>
              <p
                key={currentSuggestion}
                className={`text-lg text-[#2C2C2C]/50 font-light transition-opacity duration-300 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {currentSuggestion}
              </p>
            </div>

            <div className="space-y-4" style={{ marginTop: '-25px' }}>
              <Textarea
                ref={textareaRef}
                value={promiseText}
                onChange={(e) => setPromiseText(e.target.value)}
                placeholder="I promise to..."
                className="min-h-[120px] text-[1rem] placeholder:text-[1rem] [&:not(:placeholder-shown)]:text-[1.5rem] bg-white border-[#2C2C2C]/10 focus:border-[#2C2C2C]/30 resize-none rounded-2xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreatePromise();
                  }
                }}
              />
              <div style={{ marginTop: '15px' }}>
                <Button
                  onClick={handleCreatePromise}
                  disabled={!promiseText.trim()}
                  className="w-full py-6 text-lg bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-white rounded-full transition-all duration-300"
                >
                  Create Promise
                </Button>
              </div>
            </div>
          </div>
        </main>

        <JournalSlideOutPanel
          isOpen={isJournalOpen}
          onClose={() => setIsJournalOpen(false)}
          onLogout={handleLogout}
          onResetToday={handleResetToday}
        />
      </div>
    );
  }

  // Confirm State
  if (appState === 'confirm') {
    return (
      <div className="min-h-screen bg-[#F2F5F7] flex flex-col">
        <header className="w-full px-6 py-6 flex items-center justify-between">
          <h1
            className="font-serif text-3xl text-[#2C2C2C] tracking-tight cursor-pointer select-none"
            onClick={() => setIsJournalOpen(true)}
          >
            TODAY
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsJournalOpen(true)}
            className="text-[#2C2C2C] hover:bg-[#2C2C2C]/5"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 pb-24">
          <div className="w-full max-w-2xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl text-[#2C2C2C]/80 font-light">
                Your promise for today:
              </h2>
              <p className="text-3xl md:text-4xl text-[#2C2C2C] font-light leading-relaxed">
                "{promiseText}"
              </p>
            </div>

            <Button
              onClick={handleConfirmPromise}
              className="px-12 py-6 text-lg bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-white rounded-full transition-all duration-300"
            >
              I Promise
            </Button>
          </div>
        </main>

        <JournalSlideOutPanel
          isOpen={isJournalOpen}
          onClose={() => setIsJournalOpen(false)}
          onLogout={handleLogout}
          onResetToday={handleResetToday}
        />
      </div>
    );
  }

  // Reflect State
  if (appState === 'reflect') {
    return (
      <div className="min-h-screen bg-[#F2F5F7] flex flex-col">
        <header className="w-full px-6 py-6 flex items-center justify-between">
          <h1
            className="font-serif text-3xl text-[#2C2C2C] tracking-tight cursor-pointer select-none"
            onClick={() => setIsJournalOpen(true)}
          >
            TODAY
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsJournalOpen(true)}
            className="text-[#2C2C2C] hover:bg-[#2C2C2C]/5"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 pb-24">
          <div className="w-full max-w-2xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl text-[#2C2C2C]/80 font-light">
                Did you keep your promise?
              </h2>
              <p className="text-xl md:text-2xl text-[#2C2C2C]/60 font-light">
                "{promiseText}"
              </p>
            </div>

            <div className="flex items-center justify-center gap-12">
              <button
                onClick={() => handleReflection('positive')}
                className="group flex flex-col items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                aria-label="I kept my promise"
              >
                <div className="w-24 h-24 flex items-center justify-center">
                  <ThumbsUpIcon className="w-full h-full text-[#2C2C2C] transition-opacity group-hover:opacity-70" />
                </div>
                <span className="text-sm text-[#2C2C2C]/60 font-light">Yes</span>
              </button>

              <button
                onClick={() => handleReflection('negative')}
                className="group flex flex-col items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                aria-label="I did not keep my promise"
              >
                <div className="w-24 h-24 flex items-center justify-center">
                  <ThumbsDownIcon className="w-full h-full text-[#2C2C2C] transition-opacity group-hover:opacity-70" />
                </div>
                <span className="text-sm text-[#2C2C2C]/60 font-light">No</span>
              </button>
            </div>
          </div>
        </main>

        <JournalSlideOutPanel
          isOpen={isJournalOpen}
          onClose={() => setIsJournalOpen(false)}
          onLogout={handleLogout}
          onResetToday={handleResetToday}
        />
      </div>
    );
  }

  // Rest State
  return (
    <div className="min-h-screen bg-[#F2F5F7] flex flex-col">
      <header className="w-full px-6 py-6 flex items-center justify-between">
        <h1
          className="font-serif text-3xl text-[#2C2C2C] tracking-tight cursor-pointer select-none"
          onClick={() => setIsJournalOpen(true)}
        >
          TODAY
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsJournalOpen(true)}
          className="text-[#2C2C2C] hover:bg-[#2C2C2C]/5"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-2xl mx-auto text-center space-y-12">
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl text-[#2C2C2C]/80 font-light">
              You've completed today's reflection
            </h2>

            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="w-32 h-32 flex items-center justify-center">
                {reflectionOutcome === 'positive' ? (
                  <ThumbsUpIcon className="w-full h-full text-[#2C2C2C]" />
                ) : (
                  <ThumbsDownIcon className="w-full h-full text-[#2C2C2C]" />
                )}
              </div>
            </div>

            <p className="text-lg md:text-xl text-[#2C2C2C]/60 font-light">
              Rest now. Tomorrow is a new day.
            </p>
          </div>
        </div>
      </main>

      <JournalSlideOutPanel
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onLogout={handleLogout}
        onResetToday={handleResetToday}
      />
    </div>
  );
}
