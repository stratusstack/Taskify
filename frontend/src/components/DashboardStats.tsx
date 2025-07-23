import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, PlayCircle } from 'lucide-react';
import { Task } from '@/types/task';

interface DashboardStatsProps {
  tasks: Task[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ tasks }) => {
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'To Do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    onHold: tasks.filter(t => t.status === 'On Hold').length,
    done: tasks.filter(t => t.status === 'Done').length,
  };

  const completionRate = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

  const priorityStats = {
    critical: tasks.filter(t => t.priority === 'Critical').length,
    high: tasks.filter(t => t.priority === 'High').length,
    medium: tasks.filter(t => t.priority === 'Medium').length,
    low: tasks.filter(t => t.priority === 'Low').length,
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Task Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Done: {stats.done}</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm">In Progress: {stats.inProgress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm">To Do: {stats.todo}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm">On Hold: {stats.onHold}</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Completion Rate</span>
              <span>{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Priority Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {priorityStats.critical > 0 && (
              <div className="flex items-center justify-between">
                <Badge variant="destructive" className="text-xs">Critical</Badge>
                <span className="text-sm">{priorityStats.critical}</span>
              </div>
            )}
            {priorityStats.high > 0 && (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">High</Badge>
                <span className="text-sm">{priorityStats.high}</span>
              </div>
            )}
            {priorityStats.medium > 0 && (
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">Medium</Badge>
                <span className="text-sm">{priorityStats.medium}</span>
              </div>
            )}
            {priorityStats.low > 0 && (
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">Low</Badge>
                <span className="text-sm">{priorityStats.low}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};