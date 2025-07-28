
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TaskStatus } from '@/types/task';

interface TaskReportOverviewProps {
  tasks: Task[];
}

export const TaskReportOverview: React.FC<TaskReportOverviewProps> = ({ tasks }) => {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getTotalTimeSpent = () => {
    return tasks.reduce((total, task) => {
      return total + task.time_entries.reduce((taskTotal, entry) => {
        if (entry.end_time) {
          const diff = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
          return taskTotal + Math.floor(diff / 1000 / 60);
        }
        return taskTotal;
      }, 0);
    }, 0);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasks.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {getTasksByStatus('Done').length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {getTasksByStatus('In Progress').length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatDuration(getTotalTimeSpent())}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
