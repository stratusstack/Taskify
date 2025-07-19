
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, TaskStatus } from '@/types/task';
import { Clock, Trash, Timer, Plus } from 'lucide-react';
import { useRealTimeTimer } from '@/hooks/useRealTimeTimer';

interface TaskTableViewProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskRow: React.FC<{
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}> = ({ task, onUpdateTask, onDeleteTask }) => {
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

  const totalTime = getTotalTimeSpent();

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">::</span>
          <input type="checkbox" className="rounded" />
          <span>{task.title}</span>
          {task.description && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400">0</span>
              <span className="text-gray-400">▷</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">0%</span>
      </TableCell>
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
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </TableCell>
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
      <TableCell>
        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
          Medium
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {task.status === 'In Progress' && realTimeMinutes > 0 ? (
            <div className="flex items-center gap-1 text-blue-600">
              <Timer className="w-3 h-3" />
              <span className="text-sm">{realTimeMinutes}m {totalTime > 0 ? `(+${totalTime}m)` : ''}</span>
            </div>
          ) : totalTime > 0 ? (
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3" />
              <span className="text-sm">{totalTime}m</span>
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
      <TableCell>
        <span className="text-sm text-gray-400">Set Date</span>
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
          onClick={() => onDeleteTask(task.id)}
        >
          <Trash className="w-3 h-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask
}) => {
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const statusOrder: TaskStatus[] = ['To Do', 'In Progress', 'On Hold', 'Done'];

  return (
    <div className="space-y-6">
      {statusOrder.map(status => {
        const statusTasks = groupedTasks[status] || [];
        if (statusTasks.length === 0) return null;

        return (
          <div key={status} className="bg-white rounded-lg border">
            <div className="border-b p-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">▼</span>
                <h3 className="font-semibold text-gray-900">
                  {status} ({statusTasks.length})
                </h3>
                <span className="text-gray-400">⋯</span>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-700">Task</TableHead>
                  <TableHead className="font-medium text-gray-700">Progress</TableHead>
                  <TableHead className="font-medium text-gray-700">Labels</TableHead>
                  <TableHead className="font-medium text-gray-700">Status</TableHead>
                  <TableHead className="font-medium text-gray-700">Priority</TableHead>
                  <TableHead className="font-medium text-gray-700">Time Tracking</TableHead>
                  <TableHead className="font-medium text-gray-700">Start Date</TableHead>
                  <TableHead className="font-medium text-gray-700 w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No tasks available
                    </TableCell>
                  </TableRow>
                ) : (
                  statusTasks.map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onUpdateTask={onUpdateTask}
                      onDeleteTask={onDeleteTask}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
};
