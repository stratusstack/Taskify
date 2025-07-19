import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';

interface TimeTrackingWidgetProps {
  tasks: Task[];
  activeTask?: Task;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId?: string) => void;
}

export const TimeTrackingWidget: React.FC<TimeTrackingWidgetProps> = ({
  tasks,
  activeTask,
  onStartTimer,
  onStopTimer,
}) => {
  // All "In Progress" tasks are considered active timers
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  
  // Find other tasks that might be good candidates for starting a timer
  const otherTasks = tasks.filter(t => 
    t.status === 'To Do' || t.status === 'On Hold'
  );
  
  const getTotalTimeSpent = (task: Task) => {
    return task.timeEntries
      .filter(entry => entry.endTime)
      .reduce((total, entry) => {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime!);
        return total + (end.getTime() - start.getTime());
      }, 0);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Timer className="w-4 h-4" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {inProgressTasks.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Active Timers</h4>
            {inProgressTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => onStopTimer(task.id)}>
                    <Pause className="w-3 h-3 mr-1" />
                    Stop
                  </Button>
                </div>
                <p className="text-sm font-medium truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(getTotalTimeSpent(task))} total logged
                </p>
              </div>
            ))}
            {inProgressTasks.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{inProgressTasks.length - 3} more active timers
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Start a Timer</h4>
            {otherTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(getTotalTimeSpent(task))} logged
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onStartTimer(task.id)}
                  className="ml-2"
                >
                  <Play className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {otherTasks.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{otherTasks.length - 3} more tasks
              </p>
            )}
            {otherTasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks available
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};