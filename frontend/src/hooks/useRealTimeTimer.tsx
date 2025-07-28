
import { useState, useEffect, useRef } from 'react';
import { Task } from '@/types/task';

export const useRealTimeTimer = (task: Task) => {
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (task.status !== 'in_progress') {
      setCurrentTime(0);
      return;
    }

    const activeEntry = task.time_entries.find(entry => !entry.end_time);
    if (!activeEntry) {
      setCurrentTime(0);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = now.getTime() - new Date(activeEntry.start_time).getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      setCurrentTime(minutes);
    };

    // Update immediately
    updateTimer();

    // Then update every second for active timers
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [task.status, task.time_entries]);

  return currentTime;
};
