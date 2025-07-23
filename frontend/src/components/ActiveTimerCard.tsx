
import React from 'react';
import { Button } from '@/components/ui/button';
import { Timer, Clock, Pause, AlertCircle } from 'lucide-react';
import { Task } from '@/types/task';

interface ActiveTimerCardProps {
  task: Task;
  totalTime: number;
  currentSession: number;
  onStopTimer: (taskId: string) => void;
  formatTime: (milliseconds: number) => string;
}

/**
 * ActiveTimerCard Component
 * 
 * Displays the currently active timer with session information and controls.
 * Includes break reminders for long sessions and priority indicators.
 * Provides visual feedback with animations and status indicators.
 * 
 * @param task - The task being timed
 * @param totalTime - Total time logged for this task (in milliseconds)
 * @param currentSession - Current session duration (in milliseconds)
 * @param onStopTimer - Callback to stop the timer
 * @param formatTime - Utility function to format time display
 */
export const ActiveTimerCard: React.FC<ActiveTimerCardProps> = ({
  task,
  totalTime,
  currentSession,
  onStopTimer,
  formatTime
}) => {
  // Calculate session duration and check for long sessions
  const sessionMinutes = Math.floor(currentSession / (1000 * 60));
  const isLongSession = sessionMinutes >= 30; // Show break reminder after 30 minutes

  return (
    <div className="group p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/60 hover:border-green-300 transition-all duration-200 hover:shadow-sm">
      {/* Header with status and stop button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-700 font-medium">Active</span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onStopTimer(task.id)}
          className="h-7 px-2 text-xs opacity-80 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200 hover:text-red-700"
          aria-label={`Stop timer for ${task.title}`}
        >
          <Pause className="w-3 h-3 mr-1" />
          Stop
        </Button>
      </div>

      {/* Task title */}
      <div className="mb-2">
        <p className="text-sm font-medium text-foreground truncate leading-tight">
          {task.title}
        </p>
      </div>

      {/* Time information */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Current session time */}
          <div className="flex items-center gap-1 text-green-700">
            <Timer className="w-3 h-3" />
            <span className="font-medium">
              {formatTime(currentSession)} session
            </span>
          </div>
          
          {/* Total logged time */}
          {totalTime > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTime(totalTime)} total</span>
            </div>
          )}
        </div>

        {/* Priority indicator */}
        {task.priority === 'Critical' && (
          <AlertCircle className="w-3 h-3 text-red-500" />
        )}
      </div>

      {/* Progress indicator for long sessions */}
      {isLongSession && (
        <div className="mt-2 pt-2 border-t border-green-200/60">
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="w-3 h-3" />
            <span>Long session - consider a break</span>
          </div>
        </div>
      )}
    </div>
  );
};
