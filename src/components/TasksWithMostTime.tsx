
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Task, TaskStatus } from '@/types/task';
import { Clock, CheckCircle, Circle, Pause, AlertCircle, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

interface TasksWithMostTimeProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onActivityClick?: (task: Task) => void;
}

export const TasksWithMostTime: React.FC<TasksWithMostTimeProps> = ({ tasks, onTaskClick, onActivityClick }) => {
  const getTasksWithMostTime = () => {
    return tasks
      .map(task => ({
        ...task,
        totalTime: task.timeEntries.reduce((total, entry) => {
          if (entry.endTime) {
            const diff = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
            return total + Math.floor(diff / 1000 / 60);
          }
          return total;
        }, 0)
      }))
      .filter(task => task.totalTime > 0)
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'To Do': return <Circle className="w-4 h-4 text-gray-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'On Hold': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'Done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const tasksWithTime = getTasksWithMostTime();

  if (tasksWithTime.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks with Most Time Spent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasksWithTime.map(task => (
            <ContextMenu key={task.id}>
              <ContextMenuTrigger asChild>
                <div 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(task.status)}
                      <span className="text-xs text-gray-500">{task.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-sm">{formatDuration(task.totalTime)}</div>
                      <div className="text-xs text-gray-500">
                        {task.timeEntries.length} session{task.timeEntries.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {onActivityClick && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onActivityClick(task);
                          }}
                          title="View activity logs"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      )}
                      <CalendarIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </ContextMenuTrigger>
              
              <ContextMenuContent>
                <ContextMenuItem onClick={() => onTaskClick(task)}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  View Activity Calendar
                </ContextMenuItem>
                {onActivityClick && (
                  <ContextMenuItem onClick={() => onActivityClick(task)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Activity Log
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Click on a task to view its activity calendar or right-click for more options
        </p>
      </CardContent>
    </Card>
  );
};
