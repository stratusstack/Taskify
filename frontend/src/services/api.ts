import { AuthResponse, ChecklistItem, HitList, Project, Task, TaskNote, TimeEntry, TodoItem, User } from '@/types'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api'

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('taskify-token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      
      // Handle validation errors with detailed messages
      if (error.details && Array.isArray(error.details)) {
        throw new Error(error.details.join('. '))
      }
      
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return this.handleResponse<AuthResponse>(response)
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    })
    return this.handleResponse<AuthResponse>(response)
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<User>(response)
  }

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<Project[]>(response)
  }

  async getProject(id: number): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<Project>(response)
  }

  async createProject(data: { name: string; description?: string }): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return this.handleResponse<Project>(response)
  }

  async updateProject(id: number, data: { name: string; description?: string; archived?: boolean }): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return this.handleResponse<Project>(response)
  }

  async deleteProject(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    await this.handleResponse(response)
  }

  // Task endpoints
  async getTasks(projectId?: number): Promise<Task[]> {
    const url = new URL(`${API_BASE_URL}/tasks`)
    if (projectId) url.searchParams.append('project_id', projectId.toString())
    
    const response = await fetch(url.toString(), {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<Task[]>(response)
  }

  async getTask(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<Task>(response)
  }

  async createTask(data: {
    name: string
    description?: string
    start_date: string
    end_date?: string
    status?: string
    priority?: string
    project_id: number
  }): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return this.handleResponse<Task>(response)
  }

  async updateTask(id: number, data: {
    name: string
    description?: string
    start_date: string
    end_date?: string
    status?: string
    priority?: string
  }): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return this.handleResponse<Task>(response)
  }

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    await this.handleResponse(response)
  }

  async addTaskNote(taskId: number, content: string): Promise<TaskNote> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/notes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content })
    })
    return this.handleResponse<TaskNote>(response)
  }

  // Time tracking endpoints
  async startTimeTracking(taskId: number, description?: string): Promise<TimeEntry> {
    const response = await fetch(`${API_BASE_URL}/time-entries/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ task_id: taskId, description })
    })
    return this.handleResponse<TimeEntry>(response)
  }

  async stopTimeTracking(taskId: number): Promise<TimeEntry> {
    const response = await fetch(`${API_BASE_URL}/time-entries/stop`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ task_id: taskId })
    })
    return this.handleResponse<TimeEntry>(response)
  }

  async getActiveTimeEntry(taskId: number): Promise<TimeEntry | null> {
    const response = await fetch(`${API_BASE_URL}/time-entries/active/${taskId}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<TimeEntry | null>(response)
  }

  async getTimeEntries(taskId: number): Promise<TimeEntry[]> {
    const response = await fetch(`${API_BASE_URL}/time-entries/task/${taskId}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<TimeEntry[]>(response)
  }

  async addManualTime(taskId: number, durationMinutes: number, date?: string): Promise<TimeEntry> {
    const response = await fetch(`${API_BASE_URL}/time-entries/manual`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        task_id: taskId,
        duration_minutes: durationMinutes,
        date
      })
    })
    return this.handleResponse<TimeEntry>(response)
  }

  // Checklist endpoints
  async getChecklistItems(taskId: number): Promise<ChecklistItem[]> {
    const response = await fetch(`${API_BASE_URL}/checklist-items/task/${taskId}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<ChecklistItem[]>(response)
  }

  async createChecklistItem(taskId: number, text: string): Promise<ChecklistItem> {
    const response = await fetch(`${API_BASE_URL}/checklist-items/task/${taskId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ text })
    })
    return this.handleResponse<ChecklistItem>(response)
  }

  async updateChecklistItem(id: number, data: { text?: string; is_completed?: boolean }): Promise<ChecklistItem> {
    const response = await fetch(`${API_BASE_URL}/checklist-items/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return this.handleResponse<ChecklistItem>(response)
  }

  async deleteChecklistItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/checklist-items/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    await this.handleResponse(response)
  }

  async reorderChecklistItems(taskId: number, itemIds: number[]): Promise<ChecklistItem[]> {
    const response = await fetch(`${API_BASE_URL}/checklist-items/task/${taskId}/reorder`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ itemIds })
    })
    return this.handleResponse<ChecklistItem[]>(response)
  }

  // Hit List endpoints
  async getHitList(): Promise<HitList | null> {
    const response = await fetch(`${API_BASE_URL}/hit-lists`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<HitList | null>(response)
  }

  async addTodoItem(text: string): Promise<TodoItem> {
    const response = await fetch(`${API_BASE_URL}/hit-lists/items`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ text })
    })
    return this.handleResponse<TodoItem>(response)
  }

  async updateTodoItem(itemId: number, updates: Partial<TodoItem>): Promise<TodoItem> {
    const response = await fetch(`${API_BASE_URL}/hit-lists/items/${itemId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    })
    return this.handleResponse<TodoItem>(response)
  }

  async deleteTodoItem(itemId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/hit-lists/items/${itemId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    await this.handleResponse(response)
  }
}

export const apiService = new ApiService()