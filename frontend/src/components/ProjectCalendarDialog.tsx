import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProjectCalendar } from './ProjectCalendar';
import { Task } from '@/types/task';

interface ProjectCalendarDialogProps {
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectCalendarDialog: React.FC<ProjectCalendarDialogProps> = ({
  tasks,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Calendar View</DialogTitle>
        </DialogHeader>
        <ProjectCalendar tasks={tasks} />
      </DialogContent>
    </Dialog>
  );
};