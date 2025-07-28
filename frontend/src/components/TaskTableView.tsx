
import React from 'react';
import { Table } from '@/components/ui/table';
import { Task, TaskStatus } from '@/types/task';
import { ProjectColumnConfig } from '@/components/ProjectConfigDialog';
import { TaskTableStatus } from '@/components/TaskTableStatus';
import { TaskTableHeader } from '@/components/TaskTableHeader';
import { TaskTableBody } from '@/components/TaskTableBody';
import { getStatusStyling } from '@/utils/taskTableUtils';

interface TaskTableViewProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  columnConfig: ProjectColumnConfig;
  onActivityClick?: (task: Task) => void;
}

/**
 * TaskTableView Component
 * 
 * Displays tasks in a table format grouped by status with collapsible sections.
 * Each status group has its own styled container with task count and visual indicators.
 * 
 * @param tasks - Array of tasks to display
 * @param onUpdateTask - Callback for task updates
 * @param onDeleteTask - Callback for task deletion
 * @param columnConfig - Configuration object defining which columns to show
 * @param onActivityClick - Optional callback for activity/history clicks
 */
export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  columnConfig,
  onActivityClick
}) => {
  // Group tasks by status for organized display
  // Uses memoization to prevent unnecessary recalculations
  const groupedTasks = React.useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  const statusOrder: TaskStatus[] = ['to_do', 'in_progress', 'on_hold', 'done'];

  return (
    <div className="space-y-6">
      {statusOrder.map(status => {
        const statusTasks = groupedTasks[status] || [];
        if (statusTasks.length === 0) return null;

        const styling = getStatusStyling(status);

        return (
          <section 
            key={status} 
            className={`bg-white rounded-lg border shadow-sm ${styling.container} ${styling.accent}`}
            aria-labelledby={`status-${status.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <TaskTableStatus status={status} taskCount={statusTasks.length} />
            
            <Table role="table">
              <TaskTableHeader columnConfig={columnConfig} />
              <TaskTableBody
                tasks={statusTasks}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                columnConfig={columnConfig}
                onActivityClick={onActivityClick}
              />
            </Table>
          </section>
        );
      })}
    </div>
  );
};
