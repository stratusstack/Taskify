
import { useEffect, useRef } from 'react';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

interface BreakReminderOptions {
  intervalMinutes?: number;
  soundEnabled?: boolean;
}

export const useBreakReminder = (
  task: Task, 
  options: BreakReminderOptions = {}
) => {
  const { intervalMinutes = 30, soundEnabled = true } = options;
  const { toast } = useToast();
  const lastReminderRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    if (soundEnabled && !audioRef.current) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1O/BdCMFl');
    }

    if (task.status !== 'In Progress') {
      lastReminderRef.current = 0;
      return;
    }

    const activeEntry = task.timeEntries.find(entry => !entry.endTime);
    if (!activeEntry) {
      lastReminderRef.current = 0;
      return;
    }

    const checkBreakReminder = () => {
      const now = new Date();
      const startTime = new Date(activeEntry.startTime);
      const minutesWorked = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
      
      // Check if we've hit a break interval and haven't reminded for this interval
      const currentInterval = Math.floor(minutesWorked / intervalMinutes);
      
      if (currentInterval > 0 && currentInterval > lastReminderRef.current) {
        lastReminderRef.current = currentInterval;
        
        // Play sound notification
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(() => {
            // Ignore audio play errors (browser restrictions)
          });
        }
        
        // Show toast notification
        toast({
          title: "Break Reminder",
          description: `You've been working on "${task.title}" for ${minutesWorked} minutes. Consider taking a break!`,
          duration: 10000,
        });
      }
    };

    // Check immediately
    checkBreakReminder();
    
    // Then check every minute
    const interval = setInterval(checkBreakReminder, 60000);

    return () => clearInterval(interval);
  }, [task.status, task.timeEntries, task.title, intervalMinutes, soundEnabled, toast]);

  return null;
};
