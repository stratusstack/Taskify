
export type TaskStatus = 'To Do' | 'In Progress' | 'On Hold' | 'Done';

export interface TaskTimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  date: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  status: TaskStatus;
  timeEntries: TaskTimeEntry[];
  createdAt?: Date;
}
