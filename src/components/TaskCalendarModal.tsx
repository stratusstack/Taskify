
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskCalendar } from './TaskCalendar';
import { Task } from '@/types/task';

interface TaskCalendarModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskCalendarModal: React.FC<TaskCalendarModalProps> = ({
  task,
  open,
  onOpenChange,
}) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Activity Calendar</DialogTitle>
        </DialogHeader>
        <TaskCalendar task={task} />
      </DialogContent>
    </Dialog>
  );
};
