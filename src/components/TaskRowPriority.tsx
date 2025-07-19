
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
      case 'Critical':
        return 'bg-red-50 border-red-200 text-red-800 focus:ring-red-200';
      case 'High':
        return 'bg-orange-50 border-orange-200 text-orange-800 focus:ring-orange-200';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 focus:ring-yellow-200';
      case 'Low':
        return 'bg-green-50 border-green-200 text-green-800 focus:ring-green-200';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 focus:ring-gray-200';
    }
  };

  return (
    <TableCell>
      <Select 
        value={priority} 
        onValueChange={onPriorityChange}
      >
        <SelectTrigger className={`w-20 h-6 text-xs ${getPrioritySelectColor(priority)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg">
          <SelectItem value="Low" className="text-green-800 focus:bg-green-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Low
            </div>
          </SelectItem>
          <SelectItem value="Medium" className="text-yellow-800 focus:bg-yellow-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Medium
            </div>
          </SelectItem>
          <SelectItem value="High" className="text-orange-800 focus:bg-orange-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              High
            </div>
          </SelectItem>
          <SelectItem value="Critical" className="text-red-800 focus:bg-red-50">
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
