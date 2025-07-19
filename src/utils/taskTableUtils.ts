import { TaskStatus } from '@/types/task';

export interface StatusStyling {
  container: string;
  header: string;
  title: string;
  icon: string;
  accent: string;
}

export const getStatusStyling = (status: TaskStatus): StatusStyling => {
  switch (status) {
    case 'To Do':
      return {
        container: 'bg-slate-50 border-slate-200',
        header: 'bg-slate-100 border-slate-200',
        title: 'text-slate-800',
        icon: 'text-slate-500',
        accent: 'border-l-4 border-l-slate-400'
      };
    case 'In Progress':
      return {
        container: 'bg-blue-50 border-blue-200',
        header: 'bg-blue-100 border-blue-200',
        title: 'text-blue-800',
        icon: 'text-blue-500',
        accent: 'border-l-4 border-l-blue-500'
      };
    case 'On Hold':
      return {
        container: 'bg-amber-50 border-amber-200',
        header: 'bg-amber-100 border-amber-200',
        title: 'text-amber-800',
        icon: 'text-amber-500',
        accent: 'border-l-4 border-l-amber-500'
      };
    case 'Done':
      return {
        container: 'bg-emerald-50 border-emerald-200',
        header: 'bg-emerald-100 border-emerald-200',
        title: 'text-emerald-800',
        icon: 'text-emerald-500',
        accent: 'border-l-4 border-l-emerald-500'
      };
    default:
      return {
        container: 'bg-gray-50 border-gray-200',
        header: 'bg-gray-100 border-gray-200',
        title: 'text-gray-800',
        icon: 'text-gray-500',
        accent: 'border-l-4 border-l-gray-400'
      };
  }
};