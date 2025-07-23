import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Task } from '@/types/task';
import { getColorForTimeSpent, getTextColorForTimeSpent, formatTimeSpent } from '@/utils/calendarColors';

interface ProjectCalendarProps {
  tasks: Task[];
}

interface DayData {
  date: Date;
  tasks: Array<{
    task: Task;
    totalMinutes: number;
  }>;
  totalMinutes: number;
}

export const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(date => {
      const dayData: DayData = {
        date,
        tasks: [],
        totalMinutes: 0
      };

      tasks.forEach(task => {
        const dayMinutes = task.timeEntries
          .filter(entry => entry.endTime && isSameDay(new Date(entry.date), date))
          .reduce((total, entry) => {
            const start = new Date(entry.startTime);
            const end = new Date(entry.endTime!);
            return total + Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
          }, 0);

        if (dayMinutes > 0) {
          dayData.tasks.push({
            task,
            totalMinutes: dayMinutes
          });
          dayData.totalMinutes += dayMinutes;
        }
      });

      return dayData;
    });
  }, [tasks, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getWeekdays = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Time Spent Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 rounded border"></div>
                <span>≤ 30min</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-200 rounded border"></div>
                <span>≤ 1.5h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded border"></div>
                <span>≤ 4h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded border"></div>
                <span>≤ 10h</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-800 rounded border"></div>
                <span>&gt; 10h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday Headers */}
          {getWeekdays().map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarData.map(dayData => {
            const isCurrentMonth = isSameMonth(dayData.date, currentDate);
            const isToday = isSameDay(dayData.date, new Date());
            
            return (
              <Tooltip key={dayData.date.toISOString()}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      min-h-24 p-1 border rounded-md cursor-pointer transition-colors
                      ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      ${dayData.totalMinutes > 0 ? getColorForTimeSpent(dayData.totalMinutes) : ''}
                      hover:ring-1 hover:ring-primary/50
                    `}
                  >
                    <div className={`text-xs font-medium ${
                      dayData.totalMinutes > 0 ? getTextColorForTimeSpent(dayData.totalMinutes) : 
                      isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {format(dayData.date, 'd')}
                    </div>
                    
                    {dayData.totalMinutes > 0 && (
                      <div className="mt-1 space-y-1">
                        <div className={`text-xs font-medium ${getTextColorForTimeSpent(dayData.totalMinutes)}`}>
                          {formatTimeSpent(dayData.totalMinutes)}
                        </div>
                        {dayData.tasks.slice(0, 2).map(({ task }) => (
                          <Badge
                            key={task.id}
                            variant="secondary"
                            className="text-xs p-0.5 h-auto truncate w-full"
                          >
                            {task.title}
                          </Badge>
                        ))}
                        {dayData.tasks.length > 2 && (
                          <div className={`text-xs ${getTextColorForTimeSpent(dayData.totalMinutes)}`}>
                            +{dayData.tasks.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                
                {dayData.totalMinutes > 0 && (
                  <TooltipContent side="top" className="max-w-sm">
                    <div className="space-y-2">
                      <div className="font-medium">
                        {format(dayData.date, 'EEEE, MMMM d')}
                      </div>
                      <div className="text-sm">
                        Total time: {formatTimeSpent(dayData.totalMinutes)}
                      </div>
                      <div className="space-y-1">
                        {dayData.tasks.map(({ task, totalMinutes }) => (
                          <div key={task.id} className="flex justify-between text-sm">
                            <span className="truncate mr-2">{task.title}</span>
                            <span className="text-muted-foreground">
                              {formatTimeSpent(totalMinutes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>

        {/* Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Month Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Time</div>
                <div className="text-muted-foreground">
                  {formatTimeSpent(
                    calendarData.reduce((total, day) => total + day.totalMinutes, 0)
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium">Active Days</div>
                <div className="text-muted-foreground">
                  {calendarData.filter(day => day.totalMinutes > 0).length}
                </div>
              </div>
              <div>
                <div className="font-medium">Avg. Daily</div>
                <div className="text-muted-foreground">
                  {formatTimeSpent(
                    Math.round(
                      calendarData.reduce((total, day) => total + day.totalMinutes, 0) / 
                      Math.max(calendarData.filter(day => day.totalMinutes > 0).length, 1)
                    )
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium">Tasks Worked</div>
                <div className="text-muted-foreground">
                  {new Set(
                    calendarData.flatMap(day => day.tasks.map(t => t.task.id))
                  ).size}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};