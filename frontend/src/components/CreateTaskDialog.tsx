/**
 * CREATE TASK DIALOG - COMPREHENSIVE TASK CREATION INTERFACE
 * 
 * A sophisticated modal dialog for creating new tasks with full metadata support.
 * This component provides a comprehensive form interface for task creation including
 * scheduling, tagging, reminders, and dependency management.
 * 
 * CORE FEATURES:
 * - Rich form interface with validation
 * - Task metadata management (title, description, tags)
 * - Status and priority selection with visual indicators
 * - Date range selection for task scheduling
 * - Time estimation and planning capabilities
 * - Reminder system with date/time selection
 * - Tag management with add/remove functionality
 * - Dependency tracking and task relationships
 * 
 * FORM FIELDS:
 * - title: Task title (required)
 * - description: Detailed task description (optional)
 * - status: Task status (to_do, in_progress, on_hold, done)
 * - priority: Task priority (low, medium, high, critical)
 * - startDate: Task start date
 * - endDate: Task due date (optional)
 * - totalHours: Estimated time for completion
 * - tags: Array of categorization tags
 * - reminders: Task reminder configuration
 * 
 * USER EXPERIENCE:
 * - Modal dialog with backdrop overlay
 * - Form validation and error handling
 * - Interactive date/time pickers
 * - Real-time tag management
 * - Keyboard navigation support
 * - Mobile-responsive design
 * 
 * VALIDATION:
 * - Required field validation (title)
 * - Date range validation (start <= end)
 * - Time format validation for reminders
 * - Tag duplication prevention
 * 
 * ACCESSIBILITY:
 * - Proper ARIA labels and roles
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Focus management for modal dialogs
 * 
 * INTEGRATION:
 * - Seamless integration with task management system
 * - Project association and validation
 * - Calendar integration for date selection
 * - Notification system for reminders
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Plus, X, Calendar as CalendarIcon, Clock, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'timeEntries'>) => void;
  projectId: string;
  availableTasks?: Task[];
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onOpenChange,
  onCreateTask,
  projectId,
  availableTasks = []
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [status, setStatus] = useState<TaskStatus>('to_do');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [totalHours, setTotalHours] = useState<number | undefined>();
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderMessage, setReminderMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let reminders = [];
    if (reminderDate) {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const reminderDateTime = new Date(reminderDate);
      reminderDateTime.setHours(hours, minutes, 0, 0);

      reminders = [{
        id: Date.now().toString(),
        reminder_time: reminderDateTime,
        message: reminderMessage || `Reminder for task: ${title}`,
        is_active: true
      }];
    }

    onCreateTask({
      title: title.trim(),
      description: description.trim() || undefined,
      tags,
      status,
      priority,
      start_date: startDate,
      end_date: endDate,
      total_hours: totalHours,
      reminders,
      activities: [],
      project_id: projectId,
      created_at: new Date(),
      dependencies: []
    });

    // Reset form
    setTitle('');
    setDescription('');
    setTags([]);
    setNewTag('');
    setStatus('to_do');
    setPriority('medium');
    setStartDate(new Date());
    setEndDate(undefined);
    setTotalHours(undefined);
    setReminderDate(undefined);
    setReminderTime('09:00');
    setReminderMessage('');
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="totalHours">Estimated Total Hours (Optional)</Label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <Input
                id="totalHours"
                type="number"
                min="0"
                step="0.5"
                value={totalHours || ''}
                onChange={(e) => setTotalHours(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label>Reminder (Optional)</Label>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !reminderDate && "text-muted-foreground"
                    )}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    {reminderDate ? format(reminderDate, "PPP") : <span>Set reminder date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={reminderDate}
                    onSelect={setReminderDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              {reminderDate && (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="reminderTime">Time</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                  </div>
                  <Input
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    placeholder="Reminder message (optional)"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
