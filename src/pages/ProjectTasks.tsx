
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectTasksHeader } from '@/components/ProjectTasksHeader';
import { ProjectTasksTabs } from '@/components/ProjectTasksTabs';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { ProjectConfigDialog, ProjectColumnConfig } from '@/components/ProjectConfigDialog';
import { TaskActivityDialog } from '@/components/TaskActivityDialog';
import { TaskFilterDialog, TaskFilters } from '@/components/TaskFilterDialog';
import { ProjectCalendarDialog } from '@/components/ProjectCalendarDialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useProjectTasks } from '@/hooks/useProjectTasks';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { UserMenu } from '@/components/UserMenu';
import { Task, TaskActivity } from '@/types/task';

const defaultColumnConfig: ProjectColumnConfig = {
  title: true,
  progress: true,
  status: true,
  priority: true,
  tags: true,
  startDate: false,
  endDate: false,
  totalHours: false,
  timeSpent: true,
};

/**
 * ProjectTasks Page Component
 * 
 * Main page for project task management. Handles task operations, filtering,
 * time tracking, and coordinates multiple child components and dialogs.
 * 
 * Features:
 * - Multiple view modes (table, board, dependencies)
 * - Real-time timer functionality
 * - Advanced filtering and search
 * - Activity tracking and history
 * - Reminder notifications
 */
const ProjectTasks = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    statuses: [],
    priorities: [],
    tags: [],
    dateFrom: undefined,
    dateTo: undefined,
    hasNotes: undefined,
  });
  const [activeTimerTask, setActiveTimerTask] = useState<Task | undefined>();
  const [columnConfig, setColumnConfig] = useState<ProjectColumnConfig>(defaultColumnConfig);
  
  const {
    projectId,
    tasks,
    project,
    createTask,
    updateTask,
    deleteTask
  } = useProjectTasks();

  const handleAddActivity = useCallback((taskId: string, activity: Omit<TaskActivity, 'id' | 'timestamp'>) => {
    const newActivity: TaskActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    updateTask(taskId, {
      activities: [...(tasks.find(t => t.id === taskId)?.activities || []), newActivity],
    });
  }, [tasks, updateTask]);

  const handleStartTimer = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'In Progress' });
  }, [updateTask]);

  const handleStopTimer = useCallback((taskId?: string) => {
    if (taskId) {
      updateTask(taskId, { status: 'To Do' });
    } else if (activeTimerTask) {
      updateTask(activeTimerTask.id, { status: 'To Do' });
      setActiveTimerTask(undefined);
    }
  }, [updateTask, activeTimerTask]);

  const handleActivityClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowActivityDialog(true);
  }, []);

  // Synchronize active timer state with task time entries
  // Finds tasks with ongoing time entries (no end time)
  useEffect(() => {
    const taskWithActiveTimer = tasks.find(task => {
      return task.timeEntries.some(entry => !entry.endTime);
    });
    
    if (taskWithActiveTimer && taskWithActiveTimer.id !== activeTimerTask?.id) {
      setActiveTimerTask(taskWithActiveTimer);
    } else if (!taskWithActiveTimer && activeTimerTask) {
      setActiveTimerTask(undefined);
    }
  }, [tasks, activeTimerTask]);

  // Add reminder notifications
  useReminderNotifications(tasks);

  // Apply complex filtering logic with memoization for performance
  // Filters by status, priority, tags, date range, and notes presence
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
        return false;
      }

      if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
        return false;
      }

      if (filters.tags.length > 0) {
        const taskTags = task.tags || [];
        if (!filters.tags.some(tag => taskTags.includes(tag))) {
          return false;
        }
      }

      if (filters.dateFrom || filters.dateTo) {
        if (!task.endDate) return false;
        const taskDate = new Date(task.endDate);
        
        if (filters.dateFrom && taskDate < filters.dateFrom) {
          return false;
        }
        
        if (filters.dateTo && taskDate > filters.dateTo) {
          return false;
        }
      }

      if (filters.hasNotes === true) {
        const hasNotes = task.description && task.description.trim().length > 0;
        const hasActivity = task.activities && task.activities.some(a => a.type === 'note');
        if (!hasNotes && !hasActivity) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(val => 
      val !== undefined && 
      (Array.isArray(val) ? val.length > 0 : true)
    ).length;
  }, [filters]);

  if (!project) {
    return (
      <ErrorBoundary>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar tasks={tasks} />
            <SidebarInset className="flex-1">
              <header className="h-12 flex items-center justify-between border-b px-4">
                <SidebarTrigger />
                <UserMenu />
              </header>
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 min-h-[calc(100vh-3rem)]">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center py-8">
                    <p className="text-gray-500">Project not found</p>
                    <Button onClick={() => navigate('/projects')} className="mt-4">
                      Back to Projects
                    </Button>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar 
            tasks={filteredTasks}
            onCreateTask={() => setShowCreateDialog(true)}
            onShowFilters={() => setShowFilterDialog(true)}
            onShowReports={() => navigate('/reports')}
            onShowCalendar={() => setShowCalendarDialog(true)}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            activeTask={activeTimerTask}
            activeFilterCount={activeFilterCount}
          />
          <SidebarInset className="flex-1">
            <header className="h-12 flex items-center justify-between border-b px-4">
              <SidebarTrigger />
              <UserMenu />
            </header>
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 min-h-[calc(100vh-3rem)]">
              <div className="max-w-7xl mx-auto">
                <ProjectTasksHeader 
                  project={project}
                  onCreateTask={() => setShowCreateDialog(true)}
                />

                <ProjectTasksTabs
                  tasks={filteredTasks}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  columnConfig={columnConfig}
                  onConfigureColumns={() => setShowConfigDialog(true)}
                  onActivityClick={handleActivityClick}
                />

                <CreateTaskDialog
                  open={showCreateDialog}
                  onOpenChange={setShowCreateDialog}
                  onCreateTask={createTask}
                  projectId={projectId!}
                />

                <ProjectConfigDialog
                  open={showConfigDialog}
                  onOpenChange={setShowConfigDialog}
                  columnConfig={columnConfig}
                  onConfigChange={setColumnConfig}
                />

                {selectedTask && (
                  <TaskActivityDialog
                    open={showActivityDialog}
                    onOpenChange={setShowActivityDialog}
                    task={selectedTask}
                    onAddActivity={handleAddActivity}
                  />
                )}

                <TaskFilterDialog
                  open={showFilterDialog}
                  onOpenChange={setShowFilterDialog}
                  filters={filters}
                  onFiltersChange={setFilters}
                  tasks={tasks}
                />

                <ProjectCalendarDialog
                  tasks={filteredTasks}
                  open={showCalendarDialog}
                  onOpenChange={setShowCalendarDialog}
                />
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default ProjectTasks;
