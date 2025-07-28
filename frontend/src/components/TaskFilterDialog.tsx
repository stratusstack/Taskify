import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

export interface TaskFilters {
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  tags: string[];
  dateFrom?: Date;
  dateTo?: Date;
  hasNotes?: boolean;
}

interface TaskFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  tasks: Task[];
}

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'to_do', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
];

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

export const TaskFilterDialog: React.FC<TaskFilterDialogProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  tasks,
}) => {
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // Get unique tags from all tasks
  const uniqueTags = Array.from(new Set(tasks.flatMap(task => task.tags || [])));

  const handleStatusToggle = (status: TaskStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const handlePriorityToggle = (priority: TaskPriority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      statuses: [],
      priorities: [],
      tags: [],
      dateFrom: undefined,
      dateTo: undefined,
      hasNotes: undefined,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.statuses.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.hasNotes !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Tasks
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Filter tasks by status, priority, tags, and more.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={filters.statuses.includes(status.value)}
                    onCheckedChange={() => handleStatusToggle(status.value)}
                  />
                  <Label
                    htmlFor={`status-${status.value}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Badge variant="secondary" className={status.color}>
                      {status.label}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Priority Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="space-y-2">
              {priorityOptions.map((priority) => (
                <div key={priority.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority.value}`}
                    checked={filters.priorities.includes(priority.value)}
                    onCheckedChange={() => handlePriorityToggle(priority.value)}
                  />
                  <Label
                    htmlFor={`priority-${priority.value}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Badge variant="secondary" className={priority.color}>
                      {priority.label}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {uniqueTags.length > 0 && (
            <>
              <Separator />
              
              {/* Tags Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tags</Label>
                <div className="space-y-2">
                  {uniqueTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <Label
                        htmlFor={`tag-${tag}`}
                        className="cursor-pointer"
                      >
                        <Badge variant="outline">{tag}</Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Due Date Range</Label>
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => {
                        onFiltersChange({ ...filters, dateFrom: date });
                        setDateFromOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? format(filters.dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => {
                        onFiltersChange({ ...filters, dateTo: date });
                        setDateToOpen(false);
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Other</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-notes"
                checked={filters.hasNotes === true}
                onCheckedChange={(checked) => {
                  onFiltersChange({
                    ...filters,
                    hasNotes: checked ? true : undefined
                  });
                }}
              />
              <Label htmlFor="has-notes" className="cursor-pointer">
                Has notes or comments
              </Label>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <>
              <Separator />
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};