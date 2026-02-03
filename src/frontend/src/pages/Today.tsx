import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LogOut } from 'lucide-react';
import { useRotatingPromiseSuggestions } from '../hooks/useRotatingPromiseSuggestions';
import { saveTodayPromise, getTodayPromise, type TodayPromise } from '../utils/todayPromiseStorage';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Today() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [promise, setPromise] = useState('');
  const [savedPromise, setSavedPromise] = useState<TodayPromise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentSuggestion, isVisible } = useRotatingPromiseSuggestions();

  // Load existing promise on mount
  useEffect(() => {
    const existing = getTodayPromise();
    if (existing) {
      setSavedPromise(existing);
    }
  }, []);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
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

  const handleReflection = (type: 'up' | 'down') => {
    // Placeholder for future reflection functionality
    console.log(`Reflection: ${type}`);
  };

  return (
    <div className="min-h-screen bg-[#F2F5F7] flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-serif text-[#2C2C2C] tracking-tight">TODAY</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-[#2C2C2C]/60 hover:text-[#2C2C2C] hover:bg-[#2C2C2C]/5"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
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
          ) : (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="space-y-4">
                <p className="text-xl text-[#2C2C2C]/70 font-light">
                  Your promise for today:
                </p>
                <div className="bg-white/50 border border-[#2C2C2C]/20 rounded-lg p-8">
                  <p className="text-2xl text-[#2C2C2C] font-serif leading-relaxed">
                    "{savedPromise.text}"
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-8 pt-4">
                <button
                  onClick={() => handleReflection('down')}
                  className="group transition-transform hover:scale-110 active:scale-95"
                  aria-label="Thumbs down"
                >
                  <img
                    src="/assets/generated/thumbs-down.dim_128x128.png"
                    alt="Thumbs down"
                    className="w-16 h-16 opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                </button>
                
                <button
                  onClick={() => handleReflection('up')}
                  className="group transition-transform hover:scale-110 active:scale-95"
                  aria-label="Thumbs up"
                >
                  <img
                    src="/assets/generated/thumbs-up.dim_128x128.png"
                    alt="Thumbs up"
                    className="w-16 h-16 opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
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
    </div>
  );
}
