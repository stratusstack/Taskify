
import React, { useState } from 'react';
import { Task } from '@/types/task';
import { TaskCalendarModal } from './TaskCalendarModal';
import { TaskReportOverview } from './TaskReportOverview';
import { TaskStatusBreakdown } from './TaskStatusBreakdown';
import { MostUsedTags } from './MostUsedTags';
import { TasksWithMostTime } from './TasksWithMostTime';
import { TaskAreaChart } from './TaskAreaChart';

interface TaskReportProps {
  tasks: Task[];
  onActivityClick?: (task: Task) => void;
}

export const TaskReport: React.FC<TaskReportProps> = ({ tasks, onActivityClick }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowCalendar(true);
  };

  return (
    <div className="space-y-6">
      <TaskReportOverview tasks={tasks} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskStatusBreakdown tasks={tasks} />
        <MostUsedTags tasks={tasks} />
      </div>

      <TasksWithMostTime tasks={tasks} onTaskClick={handleTaskClick} onActivityClick={onActivityClick} />

      <TaskAreaChart tasks={tasks} />

      <TaskCalendarModal
        task={selectedTask}
        open={showCalendar}
        onOpenChange={setShowCalendar}
      />
    </div>
  );
};
