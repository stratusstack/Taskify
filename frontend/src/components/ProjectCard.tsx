import { Link, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Project } from '@/types'
import { 
  MoreVertical, 
  Archive, 
  Edit, 
  Trash2, 
  FolderOpen, 
  CheckSquare2
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onArchive: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onDelete, onArchive }: ProjectCardProps) {
  const [searchParams] = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'
  const completionRate = project.task_count 
    ? Math.round((project.completed_tasks || 0) / project.task_count * 100)
    : 0

  return (
    <Card className="professional-card group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              <Link to={`/projects/${project.id}/tasks${isDemoMode ? '?demo=true' : ''}`} className="break-words">
                {project.name}
              </Link>
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {project.archived && (
              <Badge variant="secondary" className="text-xs">
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(project)}>
                  <Archive className="h-4 w-4 mr-2" />
                  {project.archived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(project)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress */}
          {(project.task_count || 0) > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckSquare2 className="h-4 w-4" />
                <span>{project.task_count || 0} tasks</span>
              </div>
              
              {(project.completed_tasks || 0) > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <span>✓</span>
                  <span>{project.completed_tasks} done</span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {new Date(project.updated_at).toLocaleDateString()}
            </div>
          </div>
          
          {/* Action Button */}
          <Button 
            asChild 
            className="w-full professional-btn mt-4"
            variant={project.archived ? "outline" : "default"}
          >
            <Link to={`/projects/${project.id}/tasks${isDemoMode ? '?demo=true' : ''}`}>
              View Tasks
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}