
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';
import { Task } from '@/types/task';

interface StartTimerCardProps {
  task: Task;
  totalTime: number;
  onStartTimer: (taskId: string) => void;
  formatTime: (milliseconds: number) => string;
}

export const StartTimerCard: React.FC<StartTimerCardProps> = ({
  task,
  totalTime,
  onStartTimer,
  formatTime
}) => {
  return (
    <div className="group flex items-center justify-between p-2.5 hover:bg-muted/40 rounded-lg transition-colors border border-transparent hover:border-border/40">
      <div className="flex-1 min-w-0 mr-3">
        <div className="mb-1">
          <p className="text-sm font-medium truncate text-foreground">
            {task.title}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{task.status.toLowerCase()}</span>
          {totalTime > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(totalTime)}</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => onStartTimer(task.id)}
        className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-all hover:bg-green-50 hover:text-green-700"
        aria-label={`Start timer for ${task.title}`}
      >
        <Play className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
