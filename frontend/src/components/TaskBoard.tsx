
import React from 'react';
import { TaskColumn } from './TaskColumn';
import { Task, TaskStatus } from '@/types/task';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onActivityClick?: (task: Task) => void;
}

const statuses: TaskStatus[] = ['to_do', 'in_progress', 'on_hold', 'done'];

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
      case 'to_do': return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 shadow-slate-200/50';
      case 'in_progress': return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-blue-200/50';
      case 'on_hold': return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 shadow-amber-200/50';
      case 'done': return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 shadow-emerald-200/50';
      default: return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 shadow-slate-200/50';
    }
  };

  const getStatusTextColor = (status: TaskStatus) => {
    switch (status) {
      case 'to_do': return 'text-slate-800';
      case 'in_progress': return 'text-blue-800';
      case 'on_hold': return 'text-amber-800';
      case 'done': return 'text-emerald-800';
      default: return 'text-slate-800';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'to_do': return '📋';
      case 'in_progress': return '⚡';
      case 'on_hold': return '⏸️';
      case 'done': return '✅';
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
