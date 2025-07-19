
export type TaskStatus = 'To Do' | 'In Progress' | 'On Hold' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskTimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  date: string;
}

export interface TaskReminder {
  id: string;
  reminderTime: Date;
  message: string;
  isActive: boolean;
}

export interface TaskActivity {
  id: string;
  type: 'status_change' | 'note' | 'time_logged' | 'priority_change' | 'tag_added' | 'tag_removed';
  description: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date;
  endDate?: Date;
  totalHours?: number;
  timeEntries: TaskTimeEntry[];
  reminders: TaskReminder[];
  activities: TaskActivity[];
  createdAt?: Date;
  projectId: string;
  dependencies?: string[];
}
