// Centralized mock data for users, projects, and tasks

export interface MockUser {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface MockProject {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

// Mock Users
export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    email: "john@example.com",
    password: "password123",
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "user-2", 
    email: "jane@example.com",
    password: "password123",
    name: "Jane Smith",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    createdAt: "2024-01-02T00:00:00Z"
  }
];

// Mock Projects
export const mockProjects: MockProject[] = [
  {
    id: "project-1",
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    userId: "user-1",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: "project-2",
    name: "Mobile App Development",
    description: "Build cross-platform mobile application",
    userId: "user-1",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z"
  },
  {
    id: "project-3",
    name: "Data Migration",
    description: "Migrate legacy data to new system",
    userId: "user-2",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z"
  }
];

// Mock Tasks
export const mockTasks: MockTask[] = [
  {
    id: "task-1",
    title: "Design Homepage Layout",
    description: "Create wireframes and mockups for the new homepage",
    status: "in-progress",
    priority: "high",
    projectId: "project-1",
    userId: "user-1",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    dueDate: "2024-02-01T00:00:00Z"
  },
  {
    id: "task-2",
    title: "Setup Development Environment",
    description: "Configure local development setup",
    status: "done",
    priority: "medium",
    projectId: "project-2",
    userId: "user-1",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "task-3",
    title: "Database Schema Design",
    description: "Design the database structure for user data",
    status: "todo",
    priority: "high",
    projectId: "project-3",
    userId: "user-2",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
    dueDate: "2024-02-15T00:00:00Z"
  }
];

// Helper functions for mock API operations
export const mockApi = {
  // Auth operations
  login: async (email: string, password: string): Promise<MockUser | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    const user = mockUsers.find(u => u.email === email && u.password === password);
    return user || null;
  },

  register: async (email: string, password: string, name: string): Promise<MockUser> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      createdAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  },

  updateProfile: async (userId: string, updates: Partial<Pick<MockUser, 'name' | 'email'>>): Promise<MockUser> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  },

  // Project operations
  getProjects: async (userId: string): Promise<MockProject[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects.filter(p => p.userId === userId);
  },

  // Task operations
  getTasks: async (projectId: string): Promise<MockTask[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTasks.filter(t => t.projectId === projectId);
  }
};