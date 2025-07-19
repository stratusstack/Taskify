
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
          priority: task.priority || 'Medium',
          startDate: task.startDate ? new Date(task.startDate) : new Date(task.createdAt || Date.now()),
          endDate: task.endDate ? new Date(task.endDate) : undefined,
          totalHours: task.totalHours || undefined,
          reminders: task.reminders?.map((reminder: any) => ({
            ...reminder,
            reminderTime: new Date(reminder.reminderTime)
          })) || [],
          timeEntries: task.timeEntries?.map((entry: any) => ({
            ...entry,
            startTime: new Date(entry.startTime),
            endTime: entry.endTime ? new Date(entry.endTime) : undefined
          })) || [],
          activities: task.activities?.map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          })) || [],
          projectId: task.projectId || 'personal',
          dependencies: task.dependencies || []
        }));
        
        // Filter tasks for this project
        const projectTasks = migratedTasks.filter((task: Task) => task.projectId === projectId);
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
          const updatedTasks = allTasks.filter((task: Task) => task.projectId !== projectId).concat(tasks);
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
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'timeEntries' | 'projectId'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      timeEntries: [],
      projectId: projectId!,
      startDate: taskData.startDate || new Date(),
      reminders: taskData.reminders || [],
      activities: [{
        id: Date.now().toString(),
        type: 'status_change',
        description: `Task created with status "${taskData.status}"`,
        timestamp: new Date()
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
            type: 'status_change' as const,
            description: `Status changed from "${task.status}" to "${updates.status}"`,
            timestamp: now
          };
          updatedTask.activities = [...updatedTask.activities, statusActivity];
          
          // End current time entry if moving from "In Progress"
          if (task.status === 'In Progress') {
            const activeEntry = task.timeEntries.find(entry => !entry.endTime);
            if (activeEntry) {
              activeEntry.endTime = now;
            }
          }
          
          // Start new time entry if moving to "In Progress"
          if (updates.status === 'In Progress') {
            const newTimeEntry: TaskTimeEntry = {
              id: Date.now().toString(),
              startTime: now,
              date: now.toDateString()
            };
            updatedTask.timeEntries = [...task.timeEntries, newTimeEntry];
          }
        }

        // Handle priority changes
        if (updates.priority && updates.priority !== task.priority) {
          const priorityActivity = {
            id: (Date.now() + Math.random()).toString(),
            type: 'priority_change' as const,
            description: `Priority changed from "${task.priority}" to "${updates.priority}"`,
            timestamp: new Date()
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
