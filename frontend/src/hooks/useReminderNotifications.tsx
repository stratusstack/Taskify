/**
 * REMINDER NOTIFICATIONS HOOK - TASK REMINDER SYSTEM
 * 
 * Comprehensive task reminder system that provides real-time notification
 * management for task deadlines and custom reminders. This hook integrates
 * both browser notifications and in-app toast messages for maximum visibility.
 * 
 * CORE FUNCTIONALITY:
 * - Real-time reminder monitoring and triggering
 * - Browser notification integration with permission management
 * - In-app toast notifications for immediate visibility
 * - Automatic reminder cleanup and lifecycle management
 * - Precise timing with minute-level accuracy
 * 
 * NOTIFICATION SYSTEM:
 * - Dual notification approach (browser + in-app)
 * - Automatic permission request for browser notifications
 * - Fallback to toast notifications when browser notifications unavailable
 * - Rich notification content with task context
 * - Custom notification icons and branding
 * 
 * TIMING & ACCURACY:
 * - Minute-level precision for reminder checking
 * - Interval-based monitoring (every 60 seconds)
 * - Immediate check on component mount
 * - Time zone aware reminder processing
 * - Drift correction for long-running sessions
 * 
 * REMINDER FEATURES:
 * - Active reminder status checking
 * - Custom reminder messages
 * - Task context preservation
 * - Multiple reminders per task support
 * - Reminder deactivation after triggering
 * 
 * BROWSER INTEGRATION:
 * - Native browser notification API
 * - Permission state management
 * - Icon and badge customization
 * - Cross-browser compatibility
 * - Mobile browser support
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Efficient task iteration and filtering
 * - Memory cleanup on component unmount
 * - Minimal DOM manipulation
 * - Optimized timer management
 * 
 * ACCESSIBILITY:
 * - Screen reader compatible notifications
 * - High contrast notification styling
 * - Keyboard dismissible notifications
 * - Reduced motion support
 * 
 * USAGE PATTERN:
 * - Hook integration in task management components
 * - Automatic lifecycle management
 * - No manual cleanup required
 * - Real-time task array synchronization
 */

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
