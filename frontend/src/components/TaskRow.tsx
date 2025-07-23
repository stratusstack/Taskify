
import React, { useState, useMemo } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Clock, Trash, Timer, Plus, Edit, MessageSquare } from 'lucide-react';
import { useRealTimeTimer } from '@/hooks/useRealTimeTimer';
import { format } from 'date-fns';
import { ProjectColumnConfig } from '@/components/ProjectConfigDialog';
import { EditTaskDialog } from '@/components/EditTaskDialog';
import { AddTagsDialog } from '@/components/AddTagsDialog';
import { formatTimeSpent } from '@/utils/calendarColors';
import { TaskRowTitle } from '@/components/TaskRowTitle';
import { TaskRowPriority } from '@/components/TaskRowPriority';

interface TaskRowProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  columnConfig: ProjectColumnConfig;
  onActivityClick?: (task: Task) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ 
  task, 
  onUpdateTask, 
  onDeleteTask, 
  columnConfig,
  onActivityClick 
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddTagsDialog, setShowAddTagsDialog] = useState(false);
  const realTimeMinutes = useRealTimeTimer(task);

  const totalTime = useMemo(() => {
    return task.timeEntries.reduce((total, entry) => {
      if (entry.endTime) {
        const diff = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
        return total + Math.floor(diff / 1000 / 60);
      }
      return total;
    }, 0);
  }, [task.timeEntries]);

  const progressPercentage = useMemo(() => {
    if (!task.totalHours) {
      return 'NA';
    }
    
    const totalMinutes = task.totalHours * 60;
    const spentMinutes = totalTime + (task.status === 'In Progress' ? realTimeMinutes : 0);
    const percentage = Math.min(Math.round((spentMinutes / totalMinutes) * 100), 100);
    
    return `${percentage}%`;
  }, [task.totalHours, totalTime, task.status, realTimeMinutes]);

  const handleStatusChange = (value: TaskStatus) => {
    onUpdateTask(task.id, { status: value });
  };

  const handlePriorityChange = (value: TaskPriority) => {
    onUpdateTask(task.id, { priority: value });
  };

  const handleTagsUpdate = (tags: string[]) => {
    onUpdateTask(task.id, { tags });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <TableRow className="hover:bg-gray-50">
            {columnConfig.title && (
              <TaskRowTitle 
                task={task} 
                onEditClick={() => setShowEditDialog(true)} 
              />
            )}
            
            {columnConfig.progress && (
              <TableCell>
                <span className="text-sm text-gray-600">{progressPercentage}</span>
              </TableCell>
            )}
            
            {columnConfig.tags && (
              <TableCell>
                <div className="flex items-center gap-1">
                  {task.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {task.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{task.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => setShowAddTagsDialog(true)}
                      aria-label="Add tags"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
            
            {columnConfig.status && (
              <TableCell>
                <Select 
                  value={task.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-24 h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            )}
            
            {columnConfig.priority && (
              <TaskRowPriority 
                priority={task.priority}
                onPriorityChange={handlePriorityChange}
              />
            )}
            
            {columnConfig.timeSpent && (
              <TableCell>
                <div className="flex items-center gap-1">
                  {task.status === 'In Progress' && realTimeMinutes > 0 ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Timer className="w-3 h-3" />
                      <span className="text-sm">{formatTimeSpent(realTimeMinutes)} {totalTime > 0 ? `(+${formatTimeSpent(totalTime)})` : ''}</span>
                    </div>
                  ) : totalTime > 0 ? (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">{formatTimeSpent(totalTime)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-blue-600">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-sm">0m 0s</span>
                    </div>
                  )}
                </div>
              </TableCell>
            )}
            
            {columnConfig.startDate && (
              <TableCell>
                <span className="text-sm text-gray-600">
                  {task.startDate ? format(new Date(task.startDate), 'MMM dd, yyyy') : 'No date set'}
                </span>
              </TableCell>
            )}
            
            {columnConfig.endDate && (
              <TableCell>
                <span className="text-sm text-gray-600">
                  {task.endDate ? format(new Date(task.endDate), 'MMM dd, yyyy') : 'No date set'}
                </span>
              </TableCell>
            )}
            
            {columnConfig.totalHours && (
              <TableCell>
                <span className="text-sm text-gray-600">
                  {task.totalHours ? `${task.totalHours}h` : 'Not set'}
                </span>
              </TableCell>
            )}
            
            <TableCell>
              <div className="flex items-center gap-1">
                {onActivityClick && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivityClick(task);
                    }}
                    aria-label="View activity logs"
                  >
                    <MessageSquare className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                  onClick={() => onDeleteTask(task.id)}
                  aria-label="Delete task"
                >
                  <Trash className="w-3 h-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
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

      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdateTask={onUpdateTask}
      />

      <AddTagsDialog
        open={showAddTagsDialog}
        onOpenChange={setShowAddTagsDialog}
        currentTags={task.tags}
        onAddTags={handleTagsUpdate}
      />
    </>
  );
};
