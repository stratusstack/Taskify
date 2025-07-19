
import React from 'react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Task } from '@/types/task';
import { ProjectColumnConfig } from '@/components/ProjectConfigDialog';
import { TaskRow } from '@/components/TaskRow';

interface TaskTableBodyProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  columnConfig: ProjectColumnConfig;
  onActivityClick?: (task: Task) => void;
}

export const TaskTableBody: React.FC<TaskTableBodyProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  columnConfig,
  onActivityClick
}) => {
  if (tasks.length === 0) {
    const colSpan = Object.values(columnConfig).filter(Boolean).length + 1;
    
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={colSpan} className="text-center py-8 text-gray-500">
            No tasks available
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {tasks.map(task => (
        <TaskRow
          key={task.id}
          task={task}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          columnConfig={columnConfig}
          onActivityClick={onActivityClick}
        />
      ))}
    </TableBody>
  );
};
