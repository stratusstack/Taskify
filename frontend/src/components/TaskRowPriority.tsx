
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskPriority } from '@/types/task';

interface TaskRowPriorityProps {
  priority: TaskPriority;
  onPriorityChange: (value: TaskPriority) => void;
}

export const TaskRowPriority: React.FC<TaskRowPriorityProps> = ({
  priority,
  onPriorityChange
}) => {
  const getPrioritySelectColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800 focus:ring-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800 focus:ring-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 focus:ring-yellow-200';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800 focus:ring-green-200';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-gray-200';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'high':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'low':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  return (
    <TableCell>
      <Select 
        value={priority} 
        onValueChange={onPriorityChange}
      >
        <SelectTrigger className={`w-20 h-6 text-xs ${getPrioritySelectColor(priority)}`}>
          <div className="flex items-center gap-1">
            {getPriorityIcon(priority)}
            <span>{priority}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg">
          <SelectItem value="low" className="text-green-800 focus:bg-green-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Low
            </div>
          </SelectItem>
          <SelectItem value="medium" className="text-yellow-800 focus:bg-yellow-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Medium
            </div>
          </SelectItem>
          <SelectItem value="high" className="text-orange-800 focus:bg-orange-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              High
            </div>
          </SelectItem>
          <SelectItem value="critical" className="text-red-800 focus:bg-red-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Critical
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </TableCell>
  );
};
