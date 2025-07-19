
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Task, TaskStatus } from '@/types/task';
import { ProjectColumnConfig } from '@/components/ProjectConfigDialog';
import { TaskRow } from '@/components/TaskRow';
import { getStatusStyling } from '@/utils/taskTableUtils';

interface TaskTableViewProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  columnConfig: ProjectColumnConfig;
  onActivityClick?: (task: Task) => void;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  columnConfig,
  onActivityClick
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

        const styling = getStatusStyling(status);

        return (
          <div key={status} className={`bg-white rounded-lg border shadow-sm ${styling.container} ${styling.accent}`}>
            <div className={`border-b p-4 ${styling.header}`}>
              <div className="flex items-center gap-2">
                <span className={`${styling.icon}`}>▼</span>
                <h3 className={`font-semibold ${styling.title}`}>
                  {status} ({statusTasks.length})
                </h3>
                <span className={`${styling.icon}`}>⋯</span>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="bg-white/50">
                  {columnConfig.title && <TableHead className="font-medium text-gray-700">Task</TableHead>}
                  {columnConfig.progress && <TableHead className="font-medium text-gray-700">Progress</TableHead>}
                  {columnConfig.tags && <TableHead className="font-medium text-gray-700">Tags</TableHead>}
                  {columnConfig.status && <TableHead className="font-medium text-gray-700">Status</TableHead>}
                  {columnConfig.priority && <TableHead className="font-medium text-gray-700">Priority</TableHead>}
                  {columnConfig.timeSpent && <TableHead className="font-medium text-gray-700">Time Tracking</TableHead>}
                  {columnConfig.startDate && <TableHead className="font-medium text-gray-700">Start Date</TableHead>}
                  {columnConfig.endDate && <TableHead className="font-medium text-gray-700">End Date</TableHead>}
                  {columnConfig.totalHours && <TableHead className="font-medium text-gray-700">Total Hours</TableHead>}
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
                      columnConfig={columnConfig}
                      onActivityClick={onActivityClick}
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
