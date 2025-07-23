
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Edit } from 'lucide-react';
import { Task } from '@/types/task';

interface TaskRowTitleProps {
  task: Task;
  onEditClick: () => void;
}

export const TaskRowTitle: React.FC<TaskRowTitleProps> = ({
  task,
  onEditClick
}) => {
  return (
    <TableCell className="font-medium">
      <div className="flex items-center gap-2">
        <span className="text-gray-400" aria-hidden="true">::</span>
        <input 
          type="checkbox" 
          className="rounded" 
          aria-label={`Select task: ${task.title}`}
        />
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors group"
          onClick={onEditClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEditClick();
            }
          }}
          aria-label={`Edit task: ${task.title}`}
        >
          <span className="group-hover:underline">{task.title}</span>
          <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {task.description && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400" aria-hidden="true">0</span>
            <span className="text-gray-400" aria-hidden="true">▷</span>
          </div>
        )}
      </div>
    </TableCell>
  );
};
