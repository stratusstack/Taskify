
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

/**
 * TaskBoard Component
 * 
 * Kanban-style board displaying tasks organized by status columns.
 * Each column has status-specific styling and visual indicators.
 * Supports task interactions and provides visual feedback.
 */
export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onUpdateTask, onDeleteTask, onActivityClick }) => {
  // Filter tasks by status for column organization
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  // Define status-specific background colors and gradients
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'To Do': return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 shadow-slate-200/50';
      case 'In Progress': return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-blue-200/50';
      case 'On Hold': return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 shadow-amber-200/50';
      case 'Done': return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 shadow-emerald-200/50';
      default: return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 shadow-slate-200/50';
    }
  };

  const getStatusTextColor = (status: TaskStatus) => {
    switch (status) {
      case 'To Do': return 'text-slate-800';
      case 'In Progress': return 'text-blue-800';
      case 'On Hold': return 'text-amber-800';
      case 'Done': return 'text-emerald-800';
      default: return 'text-slate-800';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'To Do': return '📋';
      case 'In Progress': return '⚡';
      case 'On Hold': return '⏸️';
      case 'Done': return '✅';
      default: return '📋';
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
          statusIcon={getStatusIcon(status)}
          onActivityClick={onActivityClick}
        />
      ))}
    </div>
  );
};
