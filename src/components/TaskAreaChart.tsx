import React, { useState, useMemo } from 'react';
import { Task } from '@/types/task';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, ZoomIn, ZoomOut } from 'lucide-react';
import { TaskPickerModal } from './TaskPickerModal';
import { DateRangePicker } from './DateRangePicker';
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';

type ZoomLevel = 'daily' | 'weekly' | 'monthly';

interface TaskAreaChartProps {
  tasks: Task[];
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export const TaskAreaChart: React.FC<TaskAreaChartProps> = ({ tasks }) => {
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('daily');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 60),
    to: new Date()
  });

  const chartData = useMemo(() => {
    if (selectedTasks.length === 0) return [];

    const { from, to } = dateRange;
    let intervals: Date[] = [];
    let formatStr = '';

    switch (zoomLevel) {
      case 'daily':
        intervals = eachDayOfInterval({ start: from, end: to });
        formatStr = 'MMM dd';
        break;
      case 'weekly':
        intervals = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
        formatStr = 'MMM dd';
        break;
      case 'monthly':
        intervals = eachMonthOfInterval({ start: from, end: to });
        formatStr = 'MMM yyyy';
        break;
    }

    return intervals.map(interval => {
      const dataPoint: any = {
        date: format(interval, formatStr),
        fullDate: interval
      };

      selectedTasks.forEach((task, index) => {
        let totalHours = 0;

        task.timeEntries.forEach(entry => {
          const entryDate = new Date(entry.startTime);
          let isInPeriod = false;

          switch (zoomLevel) {
            case 'daily':
              isInPeriod = format(entryDate, 'yyyy-MM-dd') === format(interval, 'yyyy-MM-dd');
              break;
            case 'weekly':
              const weekEnd = new Date(interval.getTime() + 6 * 24 * 60 * 60 * 1000);
              isInPeriod = isWithinInterval(entryDate, { start: interval, end: weekEnd });
              break;
            case 'monthly':
              isInPeriod = format(entryDate, 'yyyy-MM') === format(interval, 'yyyy-MM');
              break;
          }

          if (isInPeriod && entry.endTime) {
            const duration = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);
            totalHours += duration;
          }
        });

        dataPoint[`task_${index}`] = Number(totalHours.toFixed(2));
      });

      return dataPoint;
    });
  }, [selectedTasks, dateRange, zoomLevel]);

  const handleZoomIn = () => {
    if (zoomLevel === 'monthly') setZoomLevel('weekly');
    else if (zoomLevel === 'weekly') setZoomLevel('daily');
  };

  const handleZoomOut = () => {
    if (zoomLevel === 'daily') setZoomLevel('weekly');
    else if (zoomLevel === 'weekly') setZoomLevel('monthly');
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setShowDatePicker(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Task Performance Over Time
            <span className="text-sm text-muted-foreground font-normal">
              ({zoomLevel} view)
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDatePicker(true)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTaskPicker(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              {selectedTasks.length}/5 Tasks
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel === 'monthly'}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel === 'daily'}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Tasks Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select up to 5 tasks to visualize their performance over time
            </p>
            <Button onClick={() => setShowTaskPicker(true)}>
              Select Tasks
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index] }}
                  />
                  {task.title}
                </div>
              ))}
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value: number, name: string) => {
                      const taskIndex = parseInt(name.split('_')[1]);
                      return [
                        `${value} hours`,
                        selectedTasks[taskIndex]?.title || 'Unknown Task'
                      ];
                    }}
                  />
                  {selectedTasks.map((_, index) => (
                    <Area
                      key={index}
                      type="monotone"
                      dataKey={`task_${index}`}
                      stackId="1"
                      stroke={CHART_COLORS[index]}
                      fill={CHART_COLORS[index]}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>

      <TaskPickerModal
        tasks={tasks}
        selectedTasks={selectedTasks}
        onSelectionChange={setSelectedTasks}
        open={showTaskPicker}
        onOpenChange={setShowTaskPicker}
      />

      <DateRangePicker
        initialRange={dateRange}
        onRangeChange={handleDateRangeChange}
        open={showDatePicker}
        onOpenChange={setShowDatePicker}
      />
    </Card>
  );
};