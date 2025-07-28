
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TaskStatus } from '@/types/task';
import { Clock, CheckCircle, Circle, Pause, AlertCircle } from 'lucide-react';

interface TaskStatusBreakdownProps {
  tasks: Task[];
}

export const TaskStatusBreakdown: React.FC<TaskStatusBreakdownProps> = ({ tasks }) => {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'to_do': return <Circle className="w-4 h-4 text-gray-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'on_hold': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusDisplayName = (status: TaskStatus) => {
    switch (status) {
      case 'to_do': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'on_hold': return 'On Hold';
      case 'done': return 'Done';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
          <Circle className="w-5 h-5" />
          Task Status Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(['to_do', 'in_progress', 'on_hold', 'done'] as TaskStatus[]).map(status => {
            const count = getTasksByStatus(status).length;
            const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
            
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium">{getStatusDisplayName(status)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{count} tasks</span>
                  <span className="text-xs text-gray-400">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
