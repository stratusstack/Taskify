import { Project, Task, TaskNote, TimeEntry } from '@/types'

export const demoUser = {
  id: 999,
  username: 'demo_user',
  email: 'demo@taskify.com',
  created_at: '2024-01-01T00:00:00Z'
}

export const demoProjects: Project[] = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design and improved UX',
    archived: false,
    user_id: 999,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-02-20T14:30:00Z',
    task_count: 8,
    completed_tasks: 5
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Native iOS and Android app for customer engagement',
    archived: false,
    user_id: 999,
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-22T16:45:00Z',
    task_count: 12,
    completed_tasks: 3
  },
  {
    id: 3,
    name: 'Marketing Campaign Q1',
    description: 'Social media and digital marketing campaign for Q1 product launch',
    archived: false,
    user_id: 999,
    created_at: '2024-01-10T11:30:00Z',
    updated_at: '2024-02-18T13:20:00Z',
    task_count: 6,
    completed_tasks: 6
  },
  {
    id: 4,
    name: 'Legacy System Migration',
    description: 'Migrate old database system to new cloud infrastructure',
    archived: true,
    user_id: 999,
    created_at: '2023-11-01T08:00:00Z',
    updated_at: '2024-01-30T17:00:00Z',
    task_count: 15,
    completed_tasks: 15
  }
]

export const demoTasks: Task[] = [
  // Website Redesign Project Tasks
  {
    id: 1,
    name: 'Create wireframes for homepage',
    description: 'Design low-fidelity wireframes focusing on user flow and information architecture',
    start_date: '2024-01-15T00:00:00Z',
    end_date: '2024-01-20T00:00:00Z',
    status: 'Done',
    priority: 'High',
    project_id: 1,
    user_id: 999,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-18T15:45:00Z',
    project_name: 'Website Redesign',
    total_time_minutes: 480
  },
  {
    id: 2,
    name: 'Design system components',
    description: 'Create reusable UI components and establish design tokens',
    start_date: '2024-01-20T00:00:00Z',
    end_date: '2024-01-25T00:00:00Z',
    status: 'Done',
    priority: 'High',
    project_id: 1,
    user_id: 999,
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-01-24T14:20:00Z',
    project_name: 'Website Redesign',
    total_time_minutes: 720
  },
  {
    id: 3,
    name: 'Frontend implementation',
    description: 'Build responsive components using React and TypeScript',
    start_date: '2024-01-25T00:00:00Z',
    end_date: '2024-02-10T00:00:00Z',
    status: 'In Progress',
    priority: 'High',
    project_id: 1,
    user_id: 999,
    created_at: '2024-01-25T08:00:00Z',
    updated_at: '2024-02-05T11:30:00Z',
    project_name: 'Website Redesign',
    total_time_minutes: 1200
  },
  {
    id: 4,
    name: 'Content migration',
    description: 'Transfer and optimize existing content for new site structure',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-02-15T00:00:00Z',
    status: 'To Do',
    priority: 'Medium',
    project_id: 1,
    user_id: 999,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    project_name: 'Website Redesign',
    total_time_minutes: 0
  },

  // Mobile App Development Tasks
  {
    id: 5,
    name: 'User research and personas',
    description: 'Conduct interviews and create user personas for mobile app',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-02-08T00:00:00Z',
    status: 'Done',
    priority: 'Critical',
    project_id: 2,
    user_id: 999,
    created_at: '2024-02-01T09:30:00Z',
    updated_at: '2024-02-07T16:45:00Z',
    project_name: 'Mobile App Development',
    total_time_minutes: 600
  },
  {
    id: 6,
    name: 'App architecture planning',
    description: 'Define technical architecture and choose technology stack',
    start_date: '2024-02-08T00:00:00Z',
    end_date: '2024-02-15T00:00:00Z',
    status: 'In Progress',
    priority: 'Critical',
    project_id: 2,
    user_id: 999,
    created_at: '2024-02-08T08:15:00Z',
    updated_at: '2024-02-12T14:30:00Z',
    project_name: 'Mobile App Development',
    total_time_minutes: 360
  },
  {
    id: 7,
    name: 'Authentication system',
    description: 'Implement secure user authentication with biometric support',
    start_date: '2024-02-15T00:00:00Z',
    end_date: '2024-02-28T00:00:00Z',
    status: 'To Do',
    priority: 'High',
    project_id: 2,
    user_id: 999,
    created_at: '2024-02-10T11:20:00Z',
    updated_at: '2024-02-10T11:20:00Z',
    project_name: 'Mobile App Development',
    total_time_minutes: 0
  },

  // Marketing Campaign Tasks
  {
    id: 8,
    name: 'Social media strategy',
    description: 'Develop comprehensive social media strategy for product launch',
    start_date: '2024-01-10T00:00:00Z',
    end_date: '2024-01-20T00:00:00Z',
    status: 'Done',
    priority: 'High',
    project_id: 3,
    user_id: 999,
    created_at: '2024-01-10T13:00:00Z',
    updated_at: '2024-01-18T17:30:00Z',
    project_name: 'Marketing Campaign Q1',
    total_time_minutes: 540
  },
  {
    id: 9,
    name: 'Content calendar creation',
    description: 'Plan and schedule content for 3-month campaign',
    start_date: '2024-01-20T00:00:00Z',
    end_date: '2024-02-01T00:00:00Z',
    status: 'Done',
    priority: 'Medium',
    project_id: 3,
    user_id: 999,
    created_at: '2024-01-20T10:45:00Z',
    updated_at: '2024-01-28T12:15:00Z',
    project_name: 'Marketing Campaign Q1',
    total_time_minutes: 420
  }
]

export const demoTaskNotes: TaskNote[] = [
  {
    id: 1,
    task_id: 1,
    content: 'Initial wireframes completed. Client feedback: needs more focus on mobile-first approach.',
    created_at: '2024-01-16T14:30:00Z'
  },
  {
    id: 2,
    task_id: 1,
    content: 'Revised wireframes based on feedback. Added mobile breakpoints and touch-friendly elements.',
    created_at: '2024-01-17T16:45:00Z'
  },
  {
    id: 3,
    task_id: 3,
    content: 'Started with header component. Using CSS Grid for responsive layout.',
    created_at: '2024-01-26T09:20:00Z'
  },
  {
    id: 4,
    task_id: 3,
    content: 'Navigation component completed. Working on hero section animations.',
    created_at: '2024-02-02T11:15:00Z'
  },
  {
    id: 5,
    task_id: 5,
    content: 'Conducted 8 user interviews. Key insight: users prioritize speed and offline functionality.',
    created_at: '2024-02-05T15:00:00Z'
  },
  {
    id: 6,
    task_id: 6,
    content: 'Decided on React Native for cross-platform development. Setting up development environment.',
    created_at: '2024-02-10T10:30:00Z'
  }
]

export const demoTimeEntries: TimeEntry[] = [
  {
    id: 1,
    task_id: 1,
    start_time: '2024-01-16T09:00:00Z',
    end_time: '2024-01-16T13:00:00Z',
    duration_minutes: 240,
    description: 'Initial wireframe sketching',
    created_at: '2024-01-16T09:00:00Z'
  },
  {
    id: 2,
    task_id: 1,
    start_time: '2024-01-17T10:00:00Z',
    end_time: '2024-01-17T14:00:00Z',
    duration_minutes: 240,
    description: 'Digital wireframe creation in Figma',
    created_at: '2024-01-17T10:00:00Z'
  },
  {
    id: 3,
    task_id: 2,
    start_time: '2024-01-21T08:30:00Z',
    end_time: '2024-01-21T17:30:00Z',
    duration_minutes: 480,
    description: 'Design system planning and component creation',
    created_at: '2024-01-21T08:30:00Z'
  },
  {
    id: 4,
    task_id: 3,
    start_time: '2024-01-26T09:00:00Z',
    end_time: '2024-01-26T18:00:00Z',
    duration_minutes: 480,
    description: 'React component setup and header implementation',
    created_at: '2024-01-26T09:00:00Z'
  }
]