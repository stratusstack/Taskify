
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FolderOpen, BarChart3, Sparkles } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="flex gap-4 mb-8">
      <Link to="/features">
        <Button 
          variant={isActive('/features') ? 'default' : 'outline'}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Features
        </Button>
      </Link>
      <Link to="/projects">
        <Button 
          variant={isActive('/projects') ? 'default' : 'outline'}
          className="gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          Projects
        </Button>
      </Link>
      <Link to="/reports">
        <Button 
          variant={isActive('/reports') ? 'default' : 'outline'}
          className="gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Reports
        </Button>
      </Link>
    </nav>
  );
};
