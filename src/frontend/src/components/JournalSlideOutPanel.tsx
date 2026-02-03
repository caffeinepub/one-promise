import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getWeekEntries, getHistorySorted } from '../utils/journalHistoryStorage';
import { formatDateHuman } from '../utils/weekUtils';
import { getOutcomeIconAlt, normalizeOutcome } from '../utils/outcomeMapping';
import { ThumbsUpIcon, ThumbsDownIcon } from '../components/icons';

interface JournalSlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onResetToday?: () => void;
}

export default function JournalSlideOutPanel({ isOpen, onClose, onLogout, onResetToday }: JournalSlideOutPanelProps) {
  const weekEntries = getWeekEntries();
  const allHistory = getHistorySorted();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  // Calculate weekly summary using normalized outcomes
  const promisesMade = weekEntries.length;
  const promisesKept = weekEntries.filter(entry => {
    if (!entry.outcome) return false;
    const normalized = normalizeOutcome(entry.outcome);
    return normalized === 'positive';
  }).length;

  const handleResetConfirm = () => {
    if (onResetToday) {
      onResetToday();
      setIsResetDialogOpen(false);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-[#F2F5F7] border-l border-[#2C2C2C]/10 flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#2C2C2C]/10">
          <SheetTitle className="text-2xl font-serif text-[#2C2C2C] tracking-tight">
            History & Weekly Reflection
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Weekly Summary */}
          <div className="px-6 py-6 border-b border-[#2C2C2C]/10">
            <p className="text-lg text-[#2C2C2C]/70 font-light">
              You kept {promisesKept} out of {promisesMade} promise{promisesMade !== 1 ? 's' : ''} this week.
            </p>
          </div>

          {/* History List */}
          <ScrollArea className="flex-1">
            <div className="px-6 py-4 space-y-4">
              {allHistory.length === 0 ? (
                <p className="text-[#2C2C2C]/40 text-center py-8">
                  No history yet. Make your first promise!
                </p>
              ) : (
                allHistory.map((entry) => {
                  const entryDate = new Date(entry.date);
                  const formattedDate = formatDateHuman(entryDate);
                  
                  return (
                    <div
                      key={entry.dayKey}
                      className="bg-white/50 border border-[#2C2C2C]/10 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-[#2C2C2C]/60 font-medium">
                          {formattedDate}
                        </p>
                        <div className="flex-shrink-0">
                          {entry.outcome ? (
                            <div className="w-6 h-6 text-[#2C2C2C] opacity-80" aria-label={getOutcomeIconAlt(normalizeOutcome(entry.outcome))}>
                              {normalizeOutcome(entry.outcome) === 'positive' ? (
                                <ThumbsUpIcon className="w-full h-full" />
                              ) : (
                                <ThumbsDownIcon className="w-full h-full" />
                              )}
                            </div>
                          ) : (
                            <span className="text-[#2C2C2C]/40 text-lg">—</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[#2C2C2C] italic leading-relaxed">
                        "{entry.promise}"
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Actions at Bottom */}
        <div className="px-6 py-6 border-t border-[#2C2C2C]/10 space-y-3">
          {onResetToday && (
            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-[#2C2C2C]/20 text-[#2C2C2C]/70 hover:bg-[#2C2C2C]/5 hover:text-[#2C2C2C]"
                >
                  Reset Today (Testing)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#F2F5F7]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-[#2C2C2C]">
                    Reset Today's Promise?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[#2C2C2C]/70">
                    This will clear today's promise, reflection, and journal entry. This action is for testing purposes only and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#2C2C2C]/20 text-[#2C2C2C]/70 hover:bg-[#2C2C2C]/5">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetConfirm}
                    className="bg-[#2C2C2C] hover:bg-[#2C2C2C]/90 text-white"
                  >
                    Reset Today
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full border-[#2C2C2C]/20 text-[#2C2C2C]/70 hover:bg-[#2C2C2C]/5 hover:text-[#2C2C2C]"
          >
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
