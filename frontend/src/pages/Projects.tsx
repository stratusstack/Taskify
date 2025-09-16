import { useState, useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import Layout from '@/components/Layout'
import { ProjectCard } from '@/components/ProjectCard'
import { ProjectDialog } from '@/components/ProjectDialog'
import { DeleteDialog } from '@/components/DeleteDialog'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/services/api'
import { Project } from '@/types'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Filter,
  FolderOpen,
  Sparkles,
  Loader2
} from 'lucide-react'
import { demoProjects, demoUser } from '@/data/demoData'

export default function Projects() {
  const { user, isLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'
  
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all')
  
  // Dialog states
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)

  useEffect(() => {
    if (isDemoMode) {
      setProjects(demoProjects)
    } else if (user) {
      loadProjects()
    }
  }, [user, isDemoMode])

  useEffect(() => {
    let filtered = projects

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(project => !project.archived)
    } else if (filterStatus === 'archived') {
      filtered = filtered.filter(project => project.archived)
    }

    setFilteredProjects(filtered)
  }, [projects, searchQuery, filterStatus])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const projectsData = await apiService.getProjects()
      setProjects(projectsData)
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (data: { name: string; description: string }) => {
    if (isDemoMode) {
      toast.error('Demo mode: Cannot create projects')
      return
    }

    try {
      setDialogLoading(true)
      const newProject = await apiService.createProject(data)
      setProjects([newProject, ...projects])
      setProjectDialogOpen(false)
      toast.success('Project created successfully!')
    } catch (error) {
      toast.error('Failed to create project')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleEditProject = async (data: { name: string; description: string }) => {
    if (!editingProject || isDemoMode) {
      toast.error('Demo mode: Cannot edit projects')
      return
    }

    try {
      setDialogLoading(true)
      const updatedProject = await apiService.updateProject(editingProject.id, data)
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p))
      setProjectDialogOpen(false)
      setEditingProject(null)
      toast.success('Project updated successfully!')
    } catch (error) {
      toast.error('Failed to update project')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete || isDemoMode) {
      toast.error('Demo mode: Cannot delete projects')
      return
    }

    try {
      setDialogLoading(true)
      await apiService.deleteProject(projectToDelete.id)
      setProjects(projects.filter(p => p.id !== projectToDelete.id))
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      toast.success('Project deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete project')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleArchiveProject = async (project: Project) => {
    if (isDemoMode) {
      toast.error('Demo mode: Cannot archive projects')
      return
    }

    try {
      const updatedProject = await apiService.updateProject(project.id, {
        name: project.name,
        description: project.description,
        archived: !project.archived
      })
      setProjects(projects.map(p => p.id === project.id ? updatedProject : p))
      toast.success(`Project ${project.archived ? 'unarchived' : 'archived'} successfully!`)
    } catch (error) {
      toast.error(`Failed to ${project.archived ? 'unarchive' : 'archive'} project`)
    }
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setProjectDialogOpen(true)
  }

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />
  }

  const currentUser = isDemoMode ? demoUser : user!

  return (
    <Layout title="Projects">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          {isDemoMode && (
            <div className="bg-accent/10 border-2 border-accent  p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="font-bold text-accent">Demo Mode</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You're viewing a demo with sample projects and tasks. 
                <span className="font-medium"> Sign up to create your own projects!</span>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {currentUser.username}! 👋
              </h2>
              <p className="text-muted-foreground">
                Manage your projects and stay organized
              </p>
            </div>
            
            <Button 
              onClick={() => setProjectDialogOpen(true)}
              className="brutalist-btn"
              disabled={isDemoMode}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 brutalist-shadow-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-[140px] brutalist-shadow-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onArchive={handleArchiveProject}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {searchQuery || filterStatus !== 'all' ? (
              <>
                <Search className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('')
                    setFilterStatus('all')
                  }}
                  className="brutalist-btn"
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to get started organizing your tasks
                </p>
                <Button 
                  onClick={() => setProjectDialogOpen(true)}
                  className="brutalist-btn"
                  disabled={isDemoMode}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </>
            )}
          </div>
        )}

        {/* Project Dialog */}
        <ProjectDialog
          open={projectDialogOpen}
          onOpenChange={(open) => {
            setProjectDialogOpen(open)
            if (!open) setEditingProject(null)
          }}
          project={editingProject}
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          loading={dialogLoading}
        />

        {/* Delete Dialog */}
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Project"
          description="This action cannot be undone. This will permanently delete the project and all its tasks."
          itemName={projectToDelete?.name || ''}
          onConfirm={handleDeleteProject}
          loading={dialogLoading}
        />
      </div>
    </Layout>
  )
}