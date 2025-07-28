
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { TaskDetailDialog } from './TaskDetailDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { Task, TaskStatus } from '@/types/task';
import { Clock, Trash, ArrowRight, Timer, Edit, MessageSquare } from 'lucide-react';
import { useRealTimeTimer } from '@/hooks/useRealTimeTimer';
import { useBreakReminder } from '@/hooks/useBreakReminder';
import { formatTimeSpent } from '@/utils/calendarColors';

interface TaskCardProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onActivityClick?: (task: Task) => void;
}

const statusOptions: TaskStatus[] = ['to_do', 'in_progress', 'on_hold', 'done'];

export const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateTask, onDeleteTask, onActivityClick }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const realTimeMinutes = useRealTimeTimer(task);
  
  // Add break reminder hook
  useBreakReminder(task, { intervalMinutes: 30, soundEnabled: true });

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
  };

  const getTotalTimeSpent = () => {
    return task.time_entries.reduce((total, entry) => {
      if (entry.end_time) {
        const diff = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
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
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card 
            className="group relative cursor-pointer bg-card border border-border/60 hover:border-border transition-all duration-200 hover:shadow-md"
            draggable
            onDragStart={handleDragStart}
            onClick={() => setShowDetails(true)}
          >
        {/* Header Section */}
        <div className="flex items-start justify-between p-4 pb-0">
          {/* Real-time timer for In Progress tasks */}
          {task.status === 'in_progress' && realTimeMinutes > 0 && (
            <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1.5 rounded-md text-xs font-medium border border-green-200">
              <Timer className="w-3.5 h-3.5" />
              <span>{realTimeMinutes}m</span>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-auto">
            {onActivityClick && (
              <Button
                size="sm"
                variant="ghost"
                className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onActivityClick(task);
                }}
                title="View activity logs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditDialog(true);
              }}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="opacity-60 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
            >
              <Trash className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 pt-3 space-y-3">
          {/* Task title */}
          <div>
            <h3 
              className="font-medium text-foreground text-sm leading-snug cursor-pointer hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditDialog(true);
              }}
            >
              {task.title}
            </h3>
          </div>

          {/* Tags section */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.slice(0, 2).map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 font-normal bg-muted/60 text-muted-foreground hover:bg-muted/80"
                >
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5 font-normal text-muted-foreground"
                >
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer Section */}
        <div className="flex items-center justify-between p-4 pt-0">
          {/* Time spent indicator */}
          {totalTime > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimeSpent(totalTime)}</span>
            </div>
          )}
          
          {/* Next status button */}
          {nextStatus && (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto text-xs px-2.5 py-1.5 h-auto gap-1.5 font-medium border-border/60 hover:border-border hover:bg-muted/50"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateTask(task.id, { status: nextStatus });
              }}
            >
              <span>{nextStatus}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
          </Card>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setShowDetails(true)}>
            <Edit className="w-4 h-4 mr-2" />
            View Details
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Task
          </ContextMenuItem>
          {onActivityClick && (
            <ContextMenuItem onClick={() => onActivityClick(task)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              View Activity Log
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem 
            onClick={() => onDeleteTask(task.id)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete Task
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <TaskDetailDialog
        task={task}
        open={showDetails}
        onOpenChange={setShowDetails}
        onUpdateTask={onUpdateTask}
      />

      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdateTask={onUpdateTask}
      />
    </>
  );
};
