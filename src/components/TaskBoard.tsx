
import React from 'react';
import { TaskColumn } from './TaskColumn';
import { Task, TaskStatus } from '@/types/task';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onActivityClick?: (task: Task) => void;
}

const statuses: TaskStatus[] = ['To Do', 'In Progress', 'On Hold', 'Done'];

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onUpdateTask, onDeleteTask, onActivityClick }) => {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'To Do': return 'bg-slate-50 border-slate-200';
      case 'In Progress': return 'bg-blue-50 border-blue-200';
      case 'On Hold': return 'bg-amber-50 border-amber-200';
      case 'Done': return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusTextColor = (status: TaskStatus) => {
    switch (status) {
      case 'To Do': return 'text-slate-700';
      case 'In Progress': return 'text-blue-700';
      case 'On Hold': return 'text-amber-700';
      case 'Done': return 'text-emerald-700';
      default: return 'text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {statuses.map(status => (
        <TaskColumn
          key={status}
          status={status}
          tasks={getTasksByStatus(status)}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          colorClass={getStatusColor(status)}
          textColorClass={getStatusTextColor(status)}
          onActivityClick={onActivityClick}
        />
      ))}
    </div>
  );
};
