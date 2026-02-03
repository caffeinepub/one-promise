import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRotatingPromiseSuggestions } from '../hooks/useRotatingPromiseSuggestions';
import { saveTodayPromise, getTodayPromise, clearTodayPromise, type TodayPromise } from '../utils/todayPromiseStorage';
import { saveTodayReflection, getTodayReflection, clearTodayReflection } from '../utils/todayReflectionStorage';
import { saveJournalEntry, updateTodayOutcome, clearJournalHistory, removeTodayEntry, repairHistoryIfNeeded } from '../utils/journalHistoryStorage';
import { thumbToOutcome, outcomeToThumb, getOutcomeIconAlt, type ThumbSelection, type ReflectionOutcome } from '../utils/outcomeMapping';
import { Alert, AlertDescription } from '@/components/ui/alert';
import JournalSlideOutPanel from '../components/JournalSlideOutPanel';
import { ThumbsUpIcon, ThumbsDownIcon } from '../components/icons';

export default function Today() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [promise, setPromise] = useState('');
  const [savedPromise, setSavedPromise] = useState<TodayPromise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentSuggestion, isVisible } = useRotatingPromiseSuggestions();
  
  // Reflection state
  const [reflection, setReflection] = useState<ReflectionOutcome | null>(null);
  const [isReflecting, setIsReflecting] = useState(false);
  const [selectedThumb, setSelectedThumb] = useState<ThumbSelection | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Journal panel state
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  // Load existing promise and reflection on mount, and run repair
  useEffect(() => {
    // Run history repair once on mount
    repairHistoryIfNeeded();
    
    const existingPromise = getTodayPromise();
    if (existingPromise) {
      setSavedPromise(existingPromise);
    }
    
    const existingReflection = getTodayReflection();
    if (existingReflection) {
      setReflection(existingReflection.outcome);
      setSelectedThumb(outcomeToThumb(existingReflection.outcome));
    }
  }, []);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    clearJournalHistory();
  };

  const handleResetToday = () => {
    // Clear today's promise
    clearTodayPromise();
    
    // Clear today's reflection
    clearTodayReflection();
    
    // Remove today's journal entry
    removeTodayEntry();
    
    // Reset UI state
    setSavedPromise(null);
    setReflection(null);
    setSelectedThumb(null);
    setShowConfirmation(false);
    setPromise('');
    setError(null);
  };

  const handleMakePromise = async () => {
    const trimmedPromise = promise.trim();
    if (!trimmedPromise) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate async operation with small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      saveTodayPromise(trimmedPromise);
      saveJournalEntry(trimmedPromise); // Save to history
      
      setSavedPromise({
        text: trimmedPromise,
        createdAt: new Date().toISOString(),
      });
      
      setPromise('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save promise. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReflection = async (type: ThumbSelection) => {
    // Prevent double-submission
    if (isReflecting || reflection) return;
    
    setIsReflecting(true);
    setSelectedThumb(type);
    
    try {
      // Brief delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Use canonical mapping
      const outcome = thumbToOutcome(type);
      saveTodayReflection(outcome);
      updateTodayOutcome(outcome); // Update history
      setReflection(outcome);
      
      // Show confirmation message
      setShowConfirmation(true);
      
      // Transition to rest mode after showing confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reflection. Please try again.');
      setSelectedThumb(null);
      setIsReflecting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: ThumbSelection) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleReflection(type);
    }
  };

  // Determine confirmation message
  const confirmationMessage = selectedThumb === 'up' 
    ? 'Well done! Rest now until tomorrow.' 
    : 'Tomorrow is a new day. Rest now.';

  // Check if we're in rest mode (reflection completed)
  const isRestMode = reflection !== null;

  // Helper to render the appropriate thumb icon
  const renderThumbIcon = (outcome: ReflectionOutcome, className: string) => {
    const IconComponent = outcome === 'positive' ? ThumbsUpIcon : ThumbsDownIcon;
    return <IconComponent className={className} />;
  };

  return (
    <div className="min-h-screen bg-[#F2F5F7] flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-serif text-[#2C2C2C] tracking-tight">TODAY</h1>
        <button
          onClick={() => setIsJournalOpen(true)}
          className="p-2 rounded-lg hover:bg-[#2C2C2C]/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2C2C]/40 focus-visible:ring-offset-2"
          aria-label="Open history and journal menu"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <line
              x1="6"
              y1="10"
              x2="26"
              y2="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-[#2C2C2C]"
            />
            <line
              x1="6"
              y1="16"
              x2="26"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-[#2C2C2C]"
            />
            <line
              x1="6"
              y1="22"
              x2="26"
              y2="22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-[#2C2C2C]"
            />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl mx-auto text-center space-y-12">
          {!savedPromise ? (
            <>
              <div className="space-y-6 animate-in fade-in duration-700">
                <p className="text-xl text-[#2C2C2C]/70 font-light">
                  What is your one promise for today?
                </p>
                
                <div className="text-[#2C2C2C]/40 text-lg italic min-h-[2rem] flex items-center justify-center">
                  <p
                    className={`transition-opacity duration-500 ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {currentSuggestion}
                  </p>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <Textarea
                  value={promise}
                  onChange={(e) => {
                    setPromise(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Type your promise here..."
                  className="w-full min-h-[120px] text-center text-lg resize-none bg-white/50 border-[#2C2C2C]/20 focus:border-[#2C2C2C]/40 focus:ring-[#2C2C2C]/20 placeholder:text-[#2C2C2C]/30"
                  disabled={isSubmitting}
                />
                
                {error && (
                  <Alert variant="destructive" className="text-left">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button
                  onClick={handleMakePromise}
                  className="w-full bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-white"
                  disabled={!promise.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Make Promise'}
                </Button>
              </div>
            </>
          ) : isRestMode ? (
            // Rest Mode - locked state after reflection
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-4">
                <p className="text-xl text-[#2C2C2C]/70 font-light">
                  Your promise for today:
                </p>
                <p className="text-2xl text-[#2C2C2C] font-serif leading-relaxed">
                  "{savedPromise.text}"
                </p>
                
                {/* Show selected thumb icon centered under promise */}
                {reflection && (
                  <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="w-16 h-16 text-[#2C2C2C] opacity-70" aria-label={getOutcomeIconAlt(reflection)}>
                      {renderThumbIcon(reflection, 'w-full h-full')}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <p className="text-lg text-[#2C2C2C]/60 font-light">
                  {reflection === 'positive' 
                    ? 'Self-trust is built on small promises.' 
                    : 'Tomorrow is a new day.'}
                </p>
              </div>
            </div>
          ) : (
            // Active reflection controls
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-4">
                <p className="text-xl text-[#2C2C2C]/70 font-light">
                  Your promise for today:
                </p>
                <p className="text-2xl text-[#2C2C2C] font-serif leading-relaxed">
                  "{savedPromise.text}"
                </p>
              </div>
              
              {showConfirmation ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-lg text-[#2C2C2C]/70 font-light">
                    {confirmationMessage}
                  </p>
                  
                  {/* Show selected thumb icon centered during confirmation */}
                  {selectedThumb && (
                    <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                      <div className="w-16 h-16 text-[#2C2C2C] opacity-70" aria-label={getOutcomeIconAlt(thumbToOutcome(selectedThumb))}>
                        {renderThumbIcon(thumbToOutcome(selectedThumb), 'w-full h-full')}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-8 pt-4">
                  <button
                    type="button"
                    onClick={() => handleReflection('down')}
                    onKeyDown={(e) => handleKeyDown(e, 'down')}
                    disabled={isReflecting}
                    className={`group transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2C2C]/40 focus-visible:ring-offset-2 rounded-lg ${
                      selectedThumb === 'down' 
                        ? 'thumb-selected' 
                        : selectedThumb === 'up' 
                        ? 'thumb-deselected' 
                        : 'hover:scale-110 active:scale-95'
                    }`}
                    aria-label="I did not keep my promise today"
                  >
                    <div
                      className={`w-16 h-16 text-[#2C2C2C] transition-opacity duration-300 ${
                        selectedThumb === 'down' 
                          ? 'opacity-100' 
                          : selectedThumb === 'up' 
                          ? 'opacity-20' 
                          : 'opacity-60 group-hover:opacity-100'
                      }`}
                    >
                      <ThumbsDownIcon className="w-full h-full" />
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleReflection('up')}
                    onKeyDown={(e) => handleKeyDown(e, 'up')}
                    disabled={isReflecting}
                    className={`group transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2C2C]/40 focus-visible:ring-offset-2 rounded-lg ${
                      selectedThumb === 'up' 
                        ? 'thumb-selected' 
                        : selectedThumb === 'down' 
                        ? 'thumb-deselected' 
                        : 'hover:scale-110 active:scale-95'
                    }`}
                    aria-label="I kept my promise today"
                  >
                    <div
                      className={`w-16 h-16 text-[#2C2C2C] transition-opacity duration-300 ${
                        selectedThumb === 'up' 
                          ? 'opacity-100' 
                          : selectedThumb === 'down' 
                          ? 'opacity-20' 
                          : 'opacity-60 group-hover:opacity-100'
                      }`}
                    >
                      <ThumbsUpIcon className="w-full h-full" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 text-center text-sm text-[#2C2C2C]/40">
        <p>
          © 2026. Built with love using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#2C2C2C]/60 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Journal Slide-Out Panel */}
      <JournalSlideOutPanel
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onLogout={handleLogout}
        onResetToday={handleResetToday}
      />
    </div>
  );
}
