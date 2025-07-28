
export type TaskStatus = 'to_do' | 'in_progress' | 'on_hold' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskTimeEntry {
  id: string;
  task_id: string;
  user_id?: string;
  start_time: Date;
  end_time?: Date;
  duration_minutes?: number;
  date: string;
  created_at?: Date;
}

export interface TaskReminder {
  id: string;
  task_id: string;
  user_id?: string;
  reminder_time: Date;
  message: string;
  is_active: boolean;
  is_sent?: boolean;
  created_at?: Date;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id?: string;
  activity_type: 'status_change' | 'note' | 'time_logged' | 'priority_change' | 'tag_added' | 'tag_removed';
  description: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface TaskTag {
  id: string;
  task_id: string;
  tag_name: string;
  created_at?: Date;
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  created_at?: Date;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assignee_id?: string;
  creator_id?: string;
  start_date?: Date;
  end_date?: Date;
  total_hours?: number;
  tags: string[];
  dependencies?: string[];
  time_entries: TaskTimeEntry[];
  reminders: TaskReminder[];
  activities: TaskActivity[];
  comments?: TaskComment[];
  created_at?: Date;
  updated_at?: Date;
  completed_at?: Date;
}
