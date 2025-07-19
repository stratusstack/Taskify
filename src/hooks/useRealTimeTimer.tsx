
import { useState, useEffect } from 'react';
import { Task } from '@/types/task';

export const useRealTimeTimer = (task: Task) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (task.status !== 'In Progress') {
      setCurrentTime(0);
      return;
    }

    const activeEntry = task.timeEntries.find(entry => !entry.endTime);
    if (!activeEntry) {
      setCurrentTime(0);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = now.getTime() - new Date(activeEntry.startTime).getTime();
      const minutes = Math.floor(diff / 1000 / 60);
      setCurrentTime(minutes);
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [task.status, task.timeEntries]);

  return currentTime;
};
