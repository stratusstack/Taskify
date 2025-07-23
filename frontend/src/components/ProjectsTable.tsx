
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, ArchiveRestore, FolderOpen } from 'lucide-react';
import { Project } from '@/types/project';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ProjectsTableProps {
  projects: Project[];
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  getProjectStats: (projectId: string) => {
    totalTasks: number;
    progress: number;
    isActive: boolean;
  };
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onUpdateProject,
  getProjectStats
}) => {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}/tasks`);
  };

  const toggleArchiveProject = (projectId: string, isArchived: boolean) => {
    onUpdateProject(projectId, { isArchived: !isArchived });
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-medium text-gray-700">Project Name</TableHead>
            <TableHead className="font-medium text-gray-700">Total Tasks</TableHead>
            <TableHead className="font-medium text-gray-700">Progress</TableHead>
            <TableHead className="font-medium text-gray-700">Active</TableHead>
            <TableHead className="font-medium text-gray-700">Created</TableHead>
            <TableHead className="font-medium text-gray-700 w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No projects available
              </TableCell>
            </TableRow>
          ) : (
            projects.map(project => {
              const stats = getProjectStats(project.id);
              return (
                <TableRow key={project.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-blue-500" />
                      <button
                        onClick={() => handleProjectClick(project.id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {project.name}
                      </button>
                      {project.isArchived && (
                        <Badge variant="secondary" className="text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>
                    {project.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {project.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{stats.totalTasks}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{stats.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={stats.isActive ? "default" : "secondary"}
                      className={stats.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {stats.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
                      onClick={() => toggleArchiveProject(project.id, project.isArchived)}
                    >
                      {project.isArchived ? (
                        <ArchiveRestore className="w-4 h-4" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
