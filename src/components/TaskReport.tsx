import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus } from '@/types/task';
import { Clock, CheckCircle, Circle, Pause, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { TaskCalendarModal } from './TaskCalendarModal';

interface TaskReportProps {
  tasks: Task[];
}

export const TaskReport: React.FC<TaskReportProps> = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowCalendar(true);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getTotalTimeSpent = () => {
    return tasks.reduce((total, task) => {
      return total + task.timeEntries.reduce((taskTotal, entry) => {
        if (entry.endTime) {
          const diff = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
          return taskTotal + Math.floor(diff / 1000 / 60);
        }
        return taskTotal;
      }, 0);
    }, 0);
  };

  const getTasksWithMostTime = () => {
    return tasks
      .map(task => ({
        ...task,
        totalTime: task.timeEntries.reduce((total, entry) => {
          if (entry.endTime) {
            const diff = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
            return total + Math.floor(diff / 1000 / 60);
          }
          return total;
        }, 0)
      }))
      .filter(task => task.totalTime > 0)
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5);
  };

  const getAllTags = () => {
    const tagCounts = tasks.reduce((acc, task) => {
      task.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'To Do': return <Circle className="w-4 h-4 text-gray-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'On Hold': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'Done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['To Do', 'In Progress', 'On Hold', 'Done'] as TaskStatus[]).map(status => {
                const count = getTasksByStatus(status).length;
                const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0;
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-sm font-medium">{status}</span>
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

        {/* Most Used Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Most Used Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getAllTags().length > 0 ? (
                getAllTags().map(([tag, count]) => (
                  <div key={tag} className="flex items-center justify-between">
                    <Badge variant="secondary">{tag}</Badge>
                    <span className="text-sm text-gray-500">{count} tasks</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No tags used yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks with Most Time */}
      {getTasksWithMostTime().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tasks with Most Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTasksWithMostTime().map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(task.status)}
                      <span className="text-xs text-gray-500">{task.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-sm">{formatDuration(task.totalTime)}</div>
                      <div className="text-xs text-gray-500">
                        {task.timeEntries.length} session{task.timeEntries.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <CalendarIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Click on a task to view its activity calendar
            </p>
          </CardContent>
        </Card>
      )}

      <TaskCalendarModal
        task={selectedTask}
        open={showCalendar}
        onOpenChange={setShowCalendar}
      />
    </div>
  );
};
