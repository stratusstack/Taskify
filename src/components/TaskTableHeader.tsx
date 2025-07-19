
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProjectColumnConfig } from '@/components/ProjectConfigDialog';

interface TaskTableHeaderProps {
  columnConfig: ProjectColumnConfig;
}

export const TaskTableHeader: React.FC<TaskTableHeaderProps> = ({
  columnConfig
}) => {
  return (
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
        <TableHead className="font-medium text-gray-700 w-16" aria-label="Actions"></TableHead>
      </TableRow>
    </TableHeader>
  );
};
