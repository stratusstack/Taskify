
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Task, TaskTimeEntry } from '@/types/task';
import { Project } from '@/types/project';

/**
 * Custom hook for managing project tasks and related operations
 * Handles CRUD operations, localStorage persistence, and state management
 * 
 * @returns {Object} Hook return object
 * @returns {string} projectId - Current project ID from route params
 * @returns {Task[]} tasks - Array of tasks for the current project
 * @returns {Project|null} project - Current project data
 * @returns {Function} createTask - Function to create a new task
 * @returns {Function} updateTask - Function to update an existing task
 * @returns {Function} deleteTask - Function to delete a task
 */
export const useProjectTasks = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  // Load tasks and project from localStorage on component mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      const savedProjects = localStorage.getItem('projects');
      
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        const migratedTasks = parsedTasks.map((task: any) => ({
          ...task,
          // Handle status enum migration
          status: task.status === 'To Do' ? 'to_do' : 
                  task.status === 'In Progress' ? 'in_progress' :
                  task.status === 'On Hold' ? 'on_hold' :
                  task.status === 'Done' ? 'done' :
                  task.status || 'to_do',
          // Handle priority enum migration
          priority: task.priority === 'Low' ? 'low' :
                   task.priority === 'Medium' ? 'medium' :
                   task.priority === 'High' ? 'high' :
                   task.priority === 'Critical' ? 'critical' :
                   task.priority || 'medium',
          // Handle field name migrations (support both old and new field names)
          project_id: task.project_id || task.projectId || 'personal',
          start_date: task.start_date ? new Date(task.start_date) : 
                     task.startDate ? new Date(task.startDate) : 
                     new Date(task.createdAt || Date.now()),
          end_date: task.end_date ? new Date(task.end_date) : 
                   task.endDate ? new Date(task.endDate) : undefined,
          total_hours: task.total_hours || task.totalHours || undefined,
          time_entries: (task.time_entries || task.timeEntries || []).map((entry: any) => ({
            ...entry,
            start_time: entry.start_time ? new Date(entry.start_time) : new Date(entry.startTime),
            end_time: entry.end_time ? (entry.end_time ? new Date(entry.end_time) : undefined) : 
                     (entry.endTime ? new Date(entry.endTime) : undefined),
            task_id: entry.task_id || entry.taskId || task.id,
            user_id: entry.user_id || entry.userId,
            created_at: entry.created_at ? new Date(entry.created_at) : new Date()
          })),
          reminders: (task.reminders || []).map((reminder: any) => ({
            ...reminder,
            reminder_time: reminder.reminder_time ? new Date(reminder.reminder_time) : new Date(reminder.reminderTime),
            is_active: reminder.is_active !== undefined ? reminder.is_active : reminder.isActive !== undefined ? reminder.isActive : true,
            task_id: reminder.task_id || reminder.taskId || task.id,
            user_id: reminder.user_id || reminder.userId,
            created_at: reminder.created_at ? new Date(reminder.created_at) : new Date()
          })),
          activities: (task.activities || []).map((activity: any) => ({
            ...activity,
            activity_type: activity.activity_type || activity.type || 'note',
            created_at: activity.created_at ? new Date(activity.created_at) : new Date(activity.timestamp || Date.now()),
            task_id: activity.task_id || activity.taskId || task.id,
            user_id: activity.user_id || activity.userId
          })),
          dependencies: task.dependencies || [],
          created_at: task.created_at ? new Date(task.created_at) : new Date(task.createdAt || Date.now()),
          updated_at: task.updated_at ? new Date(task.updated_at) : new Date(),
          // Remove old field names to prevent confusion
          projectId: undefined,
          startDate: undefined,
          endDate: undefined,
          totalHours: undefined,
          timeEntries: undefined
        }));
        
        // Filter tasks for this project
        const projectTasks = migratedTasks.filter((task: Task) => task.project_id === projectId);
        setTasks(projectTasks);
      }

      if (savedProjects && projectId) {
        const parsedProjects = JSON.parse(savedProjects);
        const currentProject = parsedProjects.find((p: Project) => p.id === projectId);
        if (currentProject) {
          setProject({
            ...currentProject,
            createdAt: new Date(currentProject.createdAt)
          });
        }
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  }, [projectId]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          const allTasks = JSON.parse(savedTasks);
          // Update tasks for this project
          const updatedTasks = allTasks.filter((task: Task) => task.project_id !== projectId).concat(tasks);
          localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        } else {
          localStorage.setItem('tasks', JSON.stringify(tasks));
        }
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    }
  }, [tasks, projectId]);

  /**
   * Creates a new task with generated ID and initial activity log
   * Automatically assigns the task to the current project
   */
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'time_entries' | 'project_id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      time_entries: [],
      project_id: projectId!,
      start_date: taskData.start_date || new Date(),
      reminders: taskData.reminders || [],
      activities: [{
        id: Date.now().toString(),
        activity_type: 'status_change',
        description: `Task created with status "${taskData.status}"`,
        created_at: new Date(),
        task_id: Date.now().toString(),
      }]
    };
    setTasks(prev => [...prev, newTask]);
  }, [projectId]);

  /**
   * Updates a task with automatic activity logging and time tracking
   * Handles status transitions, priority changes, and time entry management
   */
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates };
        
        // Ensure activities array exists
        if (!updatedTask.activities) {
          updatedTask.activities = [];
        }
        
        // Handle state transitions and time tracking
        if (updates.status && updates.status !== task.status) {
          const now = new Date();
          
          // Add activity log for status change
          const statusActivity = {
            id: (Date.now() + Math.random()).toString(),
            activity_type: 'status_change' as const,
            description: `Status changed from "${task.status}" to "${updates.status}"`,
            created_at: now,
            task_id: task.id
          };
          updatedTask.activities = [...updatedTask.activities, statusActivity];
          
          // End current time entry if moving from "in_progress"
          if (task.status === 'in_progress') {
            const activeEntry = task.time_entries.find(entry => !entry.end_time);
            if (activeEntry) {
              activeEntry.end_time = now;
            }
          }
          
          // Start new time entry if moving to "in_progress"
          if (updates.status === 'in_progress') {
            const newTimeEntry: TaskTimeEntry = {
              id: Date.now().toString(),
              task_id: task.id,
              start_time: now,
              date: now.toDateString(),
              created_at: now
            };
            updatedTask.time_entries = [...task.time_entries, newTimeEntry];
          }
        }

        // Handle priority changes
        if (updates.priority && updates.priority !== task.priority) {
          const priorityActivity = {
            id: (Date.now() + Math.random()).toString(),
            activity_type: 'priority_change' as const,
            description: `Priority changed from "${task.priority}" to "${updates.priority}"`,
            created_at: new Date(),
            task_id: task.id
          };
          updatedTask.activities = [...updatedTask.activities, priorityActivity];
        }
        
        return updatedTask;
      }
      return task;
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  return {
    projectId,
    tasks,
    project,
    createTask,
    updateTask,
    deleteTask
  };
};
