
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskDetailDialog } from './TaskDetailDialog';
import { Task, TaskStatus } from '@/types/task';
import { Clock, Trash, ArrowRight, Timer } from 'lucide-react';
import { useRealTimeTimer } from '@/hooks/useRealTimeTimer';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusOptions: TaskStatus[] = ['To Do', 'In Progress', 'On Hold', 'Done'];

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask, onDeleteTask }) => {
  const [showDetails, setShowDetails] = useState(false);
  const realTimeMinutes = useRealTimeTimer(task);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  const getTotalTimeSpent = () => {
    return task.timeEntries.reduce((total, entry) => {
      if (entry.endTime) {
        const diff = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
        return total + Math.floor(diff / 1000 / 60);
      }
      return total;
    }, 0);
  };

  const getNextStatus = () => {
    const currentIndex = statusOptions.indexOf(task.status);
    return currentIndex < statusOptions.length - 1 ? statusOptions[currentIndex + 1] : null;
  };

  const totalTime = getTotalTimeSpent();
  const nextStatus = getNextStatus();

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-white border-0 shadow-md hover:scale-105 relative group"
        draggable
        onDragStart={handleDragStart}
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-5">
          {/* Real-time timer in left corner for In Progress tasks */}
          {task.status === 'In Progress' && realTimeMinutes > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
              <Timer className="w-3 h-3" />
              <span>{realTimeMinutes}m</span>
            </div>
          )}

          {/* Top-right section with delete button and time */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs px-1 py-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
            >
              <Trash className="w-3 h-3" />
            </Button>
            
            {/* Time duration below delete button */}
            {totalTime > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{totalTime}m</span>
              </div>
            )}
          </div>

          {/* Task title with proper spacing */}
          <div className={`mb-4 ${task.status === 'In Progress' && realTimeMinutes > 0 ? 'mt-8 pr-16' : 'pr-16'}`}>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{task.title}</h3>
          </div>

          {/* Tags section */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {task.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Next status button at bottom-right */}
          {nextStatus && (
            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-3 py-1.5 h-auto gap-1 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateTask(task.id, { status: nextStatus });
                }}
              >
                <ArrowRight className="w-3 h-3" />
                {nextStatus}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskDetailDialog
        task={task}
        open={showDetails}
        onOpenChange={setShowDetails}
        onUpdateTask={onUpdateTask}
      />
    </>
  );
};
