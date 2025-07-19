import React, { useState } from 'react';
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

  const getTotalTimeSpent = () => {
    return task.timeEntries.reduce((total, entry) => {
      if (entry.endTime) {
        const diff = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
        return total + Math.floor(diff / 1000 / 60);
      }
      return total;
    }, 0);
  };

  const getPrioritySelectColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 border-red-200 text-red-800 focus:ring-red-200';
      case 'High':
        return 'bg-orange-50 border-orange-200 text-orange-800 focus:ring-orange-200';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 focus:ring-yellow-200';
      case 'Low':
        return 'bg-green-50 border-green-200 text-green-800 focus:ring-green-200';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-gray-200';
    }
  };

  const totalTime = getTotalTimeSpent();

  const getProgressPercentage = () => {
    if (!task.totalHours) {
      return 'NA';
    }
    
    const totalMinutes = task.totalHours * 60;
    const spentMinutes = totalTime + (task.status === 'In Progress' ? realTimeMinutes : 0);
    const percentage = Math.min(Math.round((spentMinutes / totalMinutes) * 100), 100);
    
    return `${percentage}%`;
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <TableRow className="hover:bg-gray-50">
            {columnConfig.title && (
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">::</span>
            <input type="checkbox" className="rounded" />
            <div 
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors group"
              onClick={() => setShowEditDialog(true)}
            >
              <span className="group-hover:underline">{task.title}</span>
              <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {task.description && (
              <div className="flex items-center gap-1">
                <span className="text-gray-400">0</span>
                <span className="text-gray-400">▷</span>
              </div>
            )}
          </div>
        </TableCell>
      )}
      
      {columnConfig.progress && (
        <TableCell>
          <span className="text-sm text-gray-600">{getProgressPercentage()}</span>
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
            onValueChange={(value: TaskStatus) => onUpdateTask(task.id, { status: value })}
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
        <TableCell>
          <Select 
            value={task.priority} 
            onValueChange={(value: TaskPriority) => onUpdateTask(task.id, { priority: value })}
          >
            <SelectTrigger className={`w-20 h-6 text-xs ${getPrioritySelectColor(task.priority)}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg">
              <SelectItem value="Low" className="text-green-800 focus:bg-green-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Low
                </div>
              </SelectItem>
              <SelectItem value="Medium" className="text-yellow-800 focus:bg-yellow-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="High" className="text-orange-800 focus:bg-orange-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  High
                </div>
              </SelectItem>
              <SelectItem value="Critical" className="text-red-800 focus:bg-red-50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Critical
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
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
              title="View activity logs"
            >
              <MessageSquare className="w-3 h-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
            onClick={() => onDeleteTask(task.id)}
            title="Delete task"
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
        onAddTags={(tags) => onUpdateTask(task.id, { tags })}
      />
    </>
  );
};