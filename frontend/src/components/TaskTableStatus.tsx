
import React from 'react';
import { TaskStatus } from '@/types/task';
import { getStatusStyling } from '@/utils/taskTableUtils';

interface TaskTableStatusProps {
  status: TaskStatus;
  taskCount: number;
}

export const TaskTableStatus: React.FC<TaskTableStatusProps> = ({
  status,
  taskCount
}) => {
  const styling = getStatusStyling(status);

  return (
    <div className={`border-b p-4 ${styling.header}`}>
      <div className="flex items-center gap-2">
        <span className={`${styling.icon}`} aria-hidden="true">▼</span>
        <h3 className={`font-semibold ${styling.title}`}>
          {status} ({taskCount})
        </h3>
        <span className={`${styling.icon}`} aria-hidden="true">⋯</span>
      </div>
    </div>
  );
};
