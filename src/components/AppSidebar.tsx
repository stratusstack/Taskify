import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { FolderOpen, Plus, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { CreateProjectDialog } from './CreateProjectDialog';
import { DashboardStats } from './DashboardStats';
import { QuickActions } from './QuickActions';
import { TaskFilters } from './TaskFilterDialog';
import { TimeTrackingWidget } from './TimeTrackingWidget';
import { Project } from '@/types/project';
import { Task } from '@/types/task';

interface AppSidebarProps {
  tasks?: Task[];
  onCreateTask?: () => void;
  onShowFilters?: () => void;
  onShowReports?: () => void;
  onShowCalendar?: () => void;
  onStartTimer?: (taskId: string) => void;
  onStopTimer?: () => void;
  activeTask?: Task;
  activeFilterCount?: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  tasks = [],
  onCreateTask,
  onShowFilters,
  onShowReports,
  onShowCalendar,
  onStartTimer,
  onStopTimer,
  activeTask,
  activeFilterCount = 0,
}) => {
  const sidebar = useSidebar();
  const collapsed = sidebar.state === 'collapsed';
  const location = useLocation();
  const params = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      const migratedProjects = parsedProjects.map((project: any) => ({
        ...project,
        createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
        isArchived: project.isArchived || false
      }));
      setProjects(migratedProjects.filter((p: Project) => !p.isArchived));
    }
  }, []);

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
    // Save to localStorage
    const allProjects = [...updatedProjects];
    localStorage.setItem('projects', JSON.stringify(allProjects));
  };

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const isOnProjectPage = params.projectId && location.pathname.includes('/tasks');

  return (
    <>
      <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
        <SidebarContent className="space-y-4">
          {/* Project Dashboard - only show when on a project page and not collapsed */}
          {!collapsed && isOnProjectPage && tasks.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <DashboardStats tasks={tasks} />
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Quick Actions - only show when not collapsed and on project page */}
          {!collapsed && isOnProjectPage && onCreateTask && (
            <SidebarGroup>
              <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <QuickActions
                  onCreateTask={onCreateTask}
                  onShowFilters={onShowFilters || (() => {})}
                  onShowReports={onShowReports || (() => {})}
                  onShowCalendar={onShowCalendar || (() => {})}
                  activeFilterCount={activeFilterCount}
                />
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Time Tracking - only show when not collapsed and on project page */}
          {!collapsed && isOnProjectPage && onStartTimer && onStopTimer && (
            <SidebarGroup>
              <SidebarGroupLabel>Time Tracking</SidebarGroupLabel>
              <SidebarGroupContent>
                <TimeTrackingWidget
                  tasks={tasks}
                  activeTask={activeTask}
                  onStartTimer={onStartTimer}
                  onStopTimer={onStopTimer}
                />
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Projects List */}
          <SidebarGroup>
            <div className="flex items-center justify-between px-2 py-1">
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              {!collapsed && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/projects/${project.id}/tasks`} 
                        className={getNavClass}
                      >
                        <FolderOpen className="w-4 h-4" />
                        {!collapsed && <span className="truncate">{project.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                {projects.length === 0 && !collapsed && (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No projects yet
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Settings */}
          {!collapsed && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/projects" className={getNavClass}>
                        <Settings className="w-4 h-4" />
                        <span>Manage Projects</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
      </Sidebar>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateProject={createProject}
      />
    </>
  );
};