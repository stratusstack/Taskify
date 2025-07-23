
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Archive, ArchiveRestore } from 'lucide-react';
import { ProjectsTable } from '@/components/ProjectsTable';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Navigation } from '@/components/Navigation';
import { Project } from '@/types/project';
import { Task } from '@/types/task';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Load projects and tasks from localStorage on component mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      const migratedProjects = parsedProjects.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt)
      }));
      setProjects(migratedProjects);
    } else {
      // Create default "Personal" project
      const defaultProject: Project = {
        id: 'personal',
        name: 'Personal',
        description: 'Default personal project',
        isArchived: false,
        createdAt: new Date()
      };
      setProjects([defaultProject]);
    }

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      const migratedTasks = parsedTasks.map((task: any) => ({
        ...task,
        priority: task.priority || 'Medium',
        startDate: task.startDate ? new Date(task.startDate) : new Date(task.createdAt || Date.now()),
        timeEntries: task.timeEntries?.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined
        })) || [],
        projectId: task.projectId || 'personal'
      }));
      setTasks(migratedTasks);
    }
  }, []);

  // Save projects and tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, ...updates } : project
    ));
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === 'Done').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isActive = projectTasks.some(task => task.status === 'In Progress' || task.status === 'On Hold');
    
    return { totalTasks, progress, isActive };
  };

  const filteredProjects = showArchived 
    ? projects 
    : projects.filter(project => !project.isArchived);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">
                Projects
              </h1>
              <p className="text-base sm:text-lg text-gray-600">Organize your tasks by projects</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowArchived(!showArchived)}
                className="gap-2 px-4 sm:px-6 text-sm sm:text-base"
              >
                {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                </span>
                <span className="sm:hidden">
                  {showArchived ? 'Hide' : 'Archived'}
                </span>
              </Button>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2 px-4 sm:px-6 text-sm sm:text-base">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </header>

        <ProjectsTable 
          projects={filteredProjects}
          onUpdateProject={updateProject}
          getProjectStats={getProjectStats}
        />

        <CreateProjectDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateProject={createProject}
        />
      </div>
    </div>
  );
};

export default Projects;
