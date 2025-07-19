
import { useEffect } from 'react';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';

export const useReminderNotifications = (tasks: Task[]) => {
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        task.reminders?.forEach(reminder => {
          if (reminder.isActive) {
            const reminderTime = new Date(reminder.reminderTime);
            const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
            
            // Check if reminder time is within 1 minute of current time
            if (timeDiff <= 60000 && now >= reminderTime) {
              // Show notification toast
              toast({
                title: "Task Reminder",
                description: reminder.message,
                duration: 10000, // Show for 10 seconds
              });
              
              // Try to show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification('Task Reminder', {
                  body: reminder.message,
                  icon: '/favicon.ico'
                });
              }
              
              console.log(`Reminder triggered for task: ${task.title} - ${reminder.message}`);
            }
          }
        });
      });
    };

    // Check reminders every minute
    const intervalId = setInterval(checkReminders, 60000);
    
    // Also check immediately when component mounts
    checkReminders();

    return () => clearInterval(intervalId);
  }, [tasks]);

  // Request notification permission when hook is used
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
};
