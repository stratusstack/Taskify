export interface User {
  id: number
  username: string
  email: string
  created_at?: string
}

export interface Project {
  id: number
  name: string
  description: string
  archived: boolean
  user_id: number
  created_at: string
  updated_at: string
  task_count?: number
  completed_tasks?: number
}

export interface Task {
  id: number
  name: string
  description: string
  start_date: string
  end_date?: string
  status: TaskStatus
  priority: TaskPriority
  project_id: number
  user_id: number
  created_at: string
  updated_at: string
  project_name?: string
  total_time_minutes?: number
  notes?: TaskNote[]
  checklist_items?: ChecklistItem[]
}

export interface TaskNote {
  id: number
  task_id: number
  content: string
  created_at: string
}

export interface ChecklistItem {
  id: number
  task_id: number
  text: string
  is_completed: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: number
  task_id: number
  start_time: string
  end_time?: string
  duration_minutes: number
  description: string
  created_at: string
}

export type TaskStatus = 'To Do' | 'In Progress' | 'On Hold' | 'Done'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface AuthResponse {
  token: string
  user: User
  message: string
}

export interface ApiError {
  error: string
  details?: string[]
}