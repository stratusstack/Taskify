
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { Clock } from 'lucide-react';

interface TaskDependencyNodeProps {
  data: {
    task: Task;
    label: string;
    status: string;
    priority: string;
  };
}

export const TaskDependencyNode: React.FC<TaskDependencyNodeProps> = ({ data }) => {
  const { task } = data;

  const getStatusColor = () => {
    switch (task.status) {
      case 'Done': return 'bg-emerald-100 border-emerald-300 text-emerald-800';
      case 'In Progress': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'On Hold': return 'bg-amber-100 border-amber-300 text-amber-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityBorder = () => {
    switch (task.priority) {
      case 'Critical': return 'border-red-500 shadow-red-500/20';
      case 'High': return 'border-orange-500 shadow-orange-500/20';
      case 'Medium': return 'border-yellow-500 shadow-yellow-500/20';
      case 'Low': return 'border-green-500 shadow-green-500/20';
      default: return 'border-gray-400 shadow-gray-400/20';
    }
  };

  const getStatusBackground = () => {
    switch (task.status) {
      case 'Done': return 'bg-emerald-50';
      case 'In Progress': return 'bg-blue-50';
      case 'On Hold': return 'bg-amber-50';
      default: return 'bg-gray-50';
    }
  };

  const getTotalTime = () => {
    return task.timeEntries.reduce((total, entry) => {
      if (entry.endTime) {
        const diff = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
        return total + Math.floor(diff / 1000 / 60);
      }
      return total;
    }, 0);
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-xl border-3 min-w-[200px] relative transition-all hover:shadow-xl ${getStatusBackground()} ${getPriorityBorder()}`}>
      {/* Left handle - for incoming dependencies (target only) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 bg-blue-500 border-2 border-white"
        style={{ left: -8 }}
      />
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-tight text-gray-800">{task.title}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-xs">
          {task.status}
        </Badge>
        {getTotalTime() > 0 && (
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{getTotalTime()}m</span>
          </div>
        )}
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Right handle - for outgoing connections (source only) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 bg-green-500 border-2 border-white"
        style={{ right: -8 }}
      />
    </div>
  );
};
