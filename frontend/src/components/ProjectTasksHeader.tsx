
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectTasksHeaderProps {
  project: Project;
  onCreateTask: () => void;
}

export const ProjectTasksHeader: React.FC<ProjectTasksHeaderProps> = ({
  project,
  onCreateTask
}) => {
  const navigate = useNavigate();

  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/projects')}
              className="gap-2 self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Projects
            </Button>
            <span className="text-gray-400 hidden sm:inline">/</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight break-words">
              {project.name}
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600">
            {project.description || 'Manage tasks for this project'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onCreateTask} className="gap-2 px-4 sm:px-6">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
