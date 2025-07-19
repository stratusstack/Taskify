
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Task } from '@/types/task';
import { getColorForTimeSpent, getTextColorForTimeSpent, formatTimeSpent, TimeSpentData } from '@/utils/calendarColors';
import { cn } from '@/lib/utils';

interface TaskCalendarProps {
  task: Task;
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ task }) => {
  // Calculate time spent per day
  const getTimeSpentByDate = (): Record<string, number> => {
    const timeByDate: Record<string, number> = {};
    
    task.timeEntries.forEach(entry => {
      if (entry.endTime) {
        const date = new Date(entry.startTime).toDateString();
        const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
        const minutes = Math.floor(duration / 1000 / 60);
        timeByDate[date] = (timeByDate[date] || 0) + minutes;
      }
    });
    
    return timeByDate;
  };

  const timeSpentByDate = getTimeSpentByDate();
  const activeDates = Object.keys(timeSpentByDate);
  
  if (activeDates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No time tracking data available for this task.
      </div>
    );
  }

  // Find the earliest and latest dates to determine the date range
  const sortedDates = activeDates
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());
  
  const earliestDate = sortedDates[0];
  const latestDate = sortedDates[sortedDates.length - 1];

  // Custom day renderer with color coding and tooltips
  const renderDay = (date: Date) => {
    const dateStr = date.toDateString();
    const timeSpent = timeSpentByDate[dateStr] || 0;
    
    if (timeSpent === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          {date.getDate()}
        </div>
      );
    }

    return (
      <div 
        className={cn(
          "w-full h-full flex items-center justify-center rounded-md transition-colors cursor-help",
          getColorForTimeSpent(timeSpent),
          getTextColorForTimeSpent(timeSpent)
        )}
        title={`${formatTimeSpent(timeSpent)} spent on ${date.toLocaleDateString()}`}
      >
        {date.getDate()}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
        <p className="text-sm text-gray-600">
          Activity from {earliestDate.toLocaleDateString()} to {latestDate.toLocaleDateString()}
        </p>
      </div>
      
      {/* Color legend */}
      <div className="flex flex-wrap justify-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span>1-30m</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-200 rounded"></div>
          <span>30-90m</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span>90-240m</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>240-600m</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-800 rounded"></div>
          <span>600m+</span>
        </div>
      </div>

      <Calendar
        mode="single"
        defaultMonth={earliestDate}
        fromDate={earliestDate}
        toDate={latestDate}
        className="pointer-events-auto mx-auto"
        components={{
          Day: ({ date }) => renderDay(date)
        }}
      />
    </div>
  );
};
