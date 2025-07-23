import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer } from 'lucide-react';
import { Task } from '@/types/task';
import { useSidebar } from '@/components/ui/sidebar';
import { ActiveTimerCard } from '@/components/ActiveTimerCard';
import { StartTimerCard } from '@/components/StartTimerCard';

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
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Enhanced sorting logic for "In Progress" tasks
  const inProgressTasks = React.useMemo(() => {
    return tasks
      .filter(t => t.status === 'In Progress')
      .sort((a, b) => {
        // Sort by most recent status change activity
        const aLastActivity = a.activities
          ?.filter(activity => activity.type === 'status_change')
          ?.sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime())[0];
        
        const bLastActivity = b.activities
          ?.filter(activity => activity.type === 'status_change')
          ?.sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime())[0];
        
        const aTime = aLastActivity ? new Date(aLastActivity.timestamp).getTime() : 0;
        const bTime = bLastActivity ? new Date(bLastActivity.timestamp).getTime() : 0;
        
        return bTime - aTime; // Most recent first
      })
      .slice(0, 5); // Maximum of 5 tasks
  }, [tasks]);

  // Other tasks for starting timers
  const otherTasks = React.useMemo(() => {
    return tasks
      .filter(t => t.status === 'To Do' || t.status === 'On Hold')
      .slice(0, 3);
  }, [tasks]);

  const getTotalTimeSpent = React.useCallback((task: Task) => {
    return task.timeEntries
      .filter(entry => entry.endTime)
      .reduce((total, entry) => {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime!);
        return total + (end.getTime() - start.getTime());
      }, 0);
  }, []);

  const getCurrentSessionTime = React.useCallback((task: Task) => {
    const activeEntry = task.timeEntries.find(entry => !entry.endTime);
    if (!activeEntry) return 0;
    
    const now = new Date();
    const start = new Date(activeEntry.startTime);
    return now.getTime() - start.getTime();
  }, []);

  const formatTime = React.useCallback((milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }, []);

  // Don't show widget when sidebar is collapsed
  if (isCollapsed) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
          <Timer className="w-5 h-5" />
          Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {inProgressTasks.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Active Timers</h4>
              <Badge variant="secondary" className="text-xs">
                {inProgressTasks.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {inProgressTasks.map((task) => {
                const totalTime = getTotalTimeSpent(task);
                const currentSession = getCurrentSessionTime(task);
                
                return (
                  <ActiveTimerCard
                    key={task.id}
                    task={task}
                    totalTime={totalTime}
                    currentSession={currentSession}
                    onStopTimer={onStopTimer}
                    formatTime={formatTime}
                  />
                );
              })}
            </div>

            {inProgressTasks.length >= 5 && (
              <p className="text-xs text-muted-foreground text-center bg-muted/30 rounded-md py-2">
                Showing recent 5 active timers
              </p>
            )}
          </section>
        )}

        {otherTasks.length > 0 ? (
          <section className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Start a Timer</h4>
            
            <div className="space-y-2">
              {otherTasks.map((task) => {
                const totalTime = getTotalTimeSpent(task);
                
                return (
                  <StartTimerCard
                    key={task.id}
                    task={task}
                    totalTime={totalTime}
                    onStartTimer={onStartTimer}
                    formatTime={formatTime}
                  />
                );
              })}
            </div>

            {otherTasks.length >= 3 && tasks.filter(t => t.status === 'To Do' || t.status === 'On Hold').length > 3 && (
              <p className="text-xs text-muted-foreground text-center bg-muted/20 rounded-md py-2">
                +{tasks.filter(t => t.status === 'To Do' || t.status === 'On Hold').length - 3} more tasks available
              </p>
            )}
          </section>
        ) : (
          inProgressTasks.length === 0 && (
            <div className="text-center py-6">
              <Timer className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No tasks available to start
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Create a task or change task status to "To Do"
              </p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};
