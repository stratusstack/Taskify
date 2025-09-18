import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Layout from '@/components/Layout'
import { TaskCard } from '@/components/TaskCard'
import { TaskDialog } from '@/components/TaskDialog'
import { TaskNotes } from '@/components/TaskNotes'
import { ChecklistManager } from '@/components/ChecklistManager'
import { DeleteDialog } from '@/components/DeleteDialog'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/services/api'
import { Project, Task, TaskStatus, TaskPriority } from '@/types'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft,
  CheckSquare2,
  Clock,
  Loader2,
  Play,
  Pause,
  Target,
  Sparkles
} from 'lucide-react'
import { demoProjects, demoTasks, demoTaskNotes } from '@/data/demoData'

const statusColors: Record<TaskStatus, string> = {
  'To Do': 'bg-gray-100 text-gray-800 border-gray-300',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
  'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Done': 'bg-green-100 text-green-800 border-green-300'
}

const getPriorityStyle = (priority: TaskPriority) => {
  const styles = {
    'Low': 'bg-gray-100 text-gray-700 border-gray-300',
    'Medium': 'bg-purple-100 text-purple-700 border-purple-300',
    'High': 'bg-orange-100 text-orange-700 border-orange-300',
    'Critical': 'bg-red-100 text-red-700 border-red-300'
  }
  return styles[priority]
}

export default function Tasks() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const isDemoMode = !user && searchParams.get('demo') === 'true'
  
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  
  // Dialog states
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [dialogLoading, setDialogLoading] = useState(false)
  const [notesLoading, setNotesLoading] = useState(false)

  const projectIdNum = parseInt(projectId || '0')

  useEffect(() => {
    if (projectIdNum) {
      if (isDemoMode) {
        loadDemoData()
      } else if (user) {
        loadData()
      }
    }
  }, [projectId, user, isDemoMode])

  useEffect(() => {
    let filtered = tasks

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  const loadDemoData = () => {
    const demoProject = demoProjects.find(p => p.id === projectIdNum)
    if (demoProject) {
      setProject(demoProject)
      const projectTasks = demoTasks
        .filter(t => t.project_id === projectIdNum)
        .map(task => ({
          ...task,
          notes: demoTaskNotes.filter(note => note.task_id === task.id)
        }))
      setTasks(projectTasks)
    }
    setLoading(false)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [projectData, tasksData] = await Promise.all([
        apiService.getProject(projectIdNum),
        apiService.getTasks(projectIdNum)
      ])
      setProject(projectData)
      setTasks(tasksData)
    } catch (error) {
      toast.error('Failed to load project data')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (data: any) => {
    if (isDemoMode) {
      toast.error('Demo mode: Cannot create tasks')
      return
    }

    try {
      setDialogLoading(true)
      const newTask = await apiService.createTask(data)
      setTasks([newTask, ...tasks])
      setTaskDialogOpen(false)
      toast.success('Task created successfully!')
    } catch (error) {
      toast.error('Failed to create task')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleEditTask = async (data: any) => {
    if (!editingTask || isDemoMode) {
      toast.error('Demo mode: Cannot edit tasks')
      return
    }

    try {
      setDialogLoading(true)
      const updatedTask = await apiService.updateTask(editingTask.id, data)
      setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t))
      setTaskDialogOpen(false)
      setEditingTask(null)
      
      // Update selected task if it's the one being edited
      if (selectedTask?.id === editingTask.id) {
        setSelectedTask(updatedTask)
      }
      
      toast.success('Task updated successfully!')
    } catch (error) {
      toast.error('Failed to update task')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete || isDemoMode) {
      toast.error('Demo mode: Cannot delete tasks')
      return
    }

    try {
      setDialogLoading(true)
      await apiService.deleteTask(taskToDelete.id)
      setTasks(tasks.filter(t => t.id !== taskToDelete.id))
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
      
      // Clear selected task if it's the one being deleted
      if (selectedTask?.id === taskToDelete.id) {
        setSelectedTask(null)
      }
      
      toast.success('Task deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete task')
    } finally {
      setDialogLoading(false)
    }
  }

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    if (isDemoMode) {
      toast.error('Demo mode: Cannot update task status')
      return
    }

    try {
      const wasInProgress = task.status === 'In Progress'
      const isMovingToInProgress = status === 'In Progress'

      // Update task status - backend handles timer automatically
      const updatedTask = await apiService.updateTask(task.id, {
        name: task.name,
        description: task.description,
        start_date: task.start_date,
        end_date: task.end_date,
        status,
        priority: task.priority
      })

      // Update task in state
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t))

      if (selectedTask?.id === task.id) {
        setSelectedTask(updatedTask)
      }

      // Show appropriate success message
      if (!wasInProgress && isMovingToInProgress) {
        toast.success(`Task marked as ${status} (timer started)`)
      } else if (wasInProgress && !isMovingToInProgress) {
        toast.success(`Task marked as ${status} (timer stopped)`)
      } else {
        toast.success(`Task marked as ${status}`)
      }

    } catch (error) {
      toast.error('Failed to update task status')
    }
  }


  const handleTaskUpdate = async () => {
    if (!isDemoMode && user) {
      try {
        const tasksData = await apiService.getTasks(projectIdNum)
        setTasks(tasksData)

        // Update selected task if one is selected - fetch detailed info
        if (selectedTask) {
          try {
            const updatedSelectedTask = await apiService.getTask(selectedTask.id)
            setSelectedTask(updatedSelectedTask)
          } catch (error) {
            // Fallback to task from list if detailed fetch fails
            const updatedSelectedTask = tasksData.find(t => t.id === selectedTask.id)
            if (updatedSelectedTask) {
              setSelectedTask(updatedSelectedTask)
            }
          }
        }
      } catch (error) {
        console.error('Failed to refresh task data:', error)
      }
    }
  }

  const handleAddNote = async (content: string) => {
    if (!selectedTask || isDemoMode) {
      toast.error('Demo mode: Cannot add notes')
      return
    }

    try {
      setNotesLoading(true)
      const newNote = await apiService.addTaskNote(selectedTask.id, content)
      
      // Update the selected task with the new note
      const updatedTask = {
        ...selectedTask,
        notes: [newNote, ...(selectedTask.notes || [])]
      }
      setSelectedTask(updatedTask)
      
      // Update the task in the tasks list
      setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t))
      
      toast.success('Note added successfully!')
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setNotesLoading(false)
    }
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const openDeleteDialog = (task: Task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  if (loading || !project) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  const completedTasks = tasks.filter(t => t.status === 'Done').length
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length
  const todoTasks = tasks.filter(t => t.status === 'To Do').length
  const onHoldTasks = tasks.filter(t => t.status === 'On Hold').length
  const totalTime = tasks.reduce((sum, task) => sum + (task.total_time_minutes || 0), 0)
  const progressPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          {isDemoMode && (
            <div className="bg-accent/10 border border-accent  p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="font-bold text-accent">Demo Mode</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You're viewing demo tasks. Sign up to create and manage your own tasks!
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects' + (isDemoMode ? '?demo=true' : ''))}
              className="professional-btn"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 break-words">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground mb-4 break-words whitespace-pre-wrap">{project.description}</p>
              )}
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <CheckSquare2 className="h-4 w-4" />
                  <span>{tasks.length} total tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{progressPercentage}% complete</span>
                </div>
                {totalTime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(totalTime)} logged</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => setTaskDialogOpen(true)}
              className="professional-btn"
              disabled={isDemoMode}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="professional-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100  flex items-center justify-center">
                      <CheckSquare2 className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">To Do</p>
                      <p className="text-2xl font-bold">{todoTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100  flex items-center justify-center">
                      <Play className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold">{inProgressTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100  flex items-center justify-center">
                      <Pause className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">On Hold</p>
                      <p className="text-2xl font-bold">{onHoldTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100  flex items-center justify-center">
                      <CheckSquare2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Done</p>
                      <p className="text-2xl font-bold">{completedTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress */}
            {tasks.length > 0 && (
              <Card className="professional-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Project Progress</span>
                    <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 professional-shadow-sm"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] professional-shadow-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] professional-shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tasks List */}
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                    onStatusChange={handleStatusChange}
                    onTaskUpdate={handleTaskUpdate}
                    onSelect={async (task) => {
                      if (!isDemoMode && user) {
                        try {
                          // Fetch detailed task info including checklist
                          const detailedTask = await apiService.getTask(task.id)
                          setSelectedTask(detailedTask)
                        } catch (error) {
                          // Fallback to basic task info if detailed fetch fails
                          setSelectedTask(task)
                        }
                      } else {
                        setSelectedTask(task)
                      }
                    }}
                    isSelected={selectedTask?.id === task.id}
                  />
                ))}
              </div>
            ) : (
              <Card className="professional-card">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckSquare2 className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                      ? 'No tasks found' 
                      : 'No tasks yet'
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first task to get started'
                    }
                  </p>
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('')
                        setStatusFilter('all')
                        setPriorityFilter('all')
                      }}
                      className="professional-btn"
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setTaskDialogOpen(true)}
                      className="professional-btn"
                      disabled={isDemoMode}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Task
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Details */}
            {selectedTask ? (
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="text-lg">Task Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1 break-words">{selectedTask.name}</h4>
                    {selectedTask.description && (
                      <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap overflow-hidden">{selectedTask.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant="outline" className={`mt-1 ${statusColors[selectedTask.status]}`}>{selectedTask.status}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <Badge variant="outline" className={`mt-1 ${getPriorityStyle(selectedTask.priority)}`}>{selectedTask.priority}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p>{new Date(selectedTask.start_date).toLocaleDateString()}</p>
                    </div>
                    {selectedTask.end_date && (
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p>{new Date(selectedTask.end_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {(selectedTask.total_time_minutes || 0) > 0 && (
                    <div>
                      <p className="text-muted-foreground text-sm">Time Logged</p>
                      <p className="font-semibold">{formatTime(selectedTask.total_time_minutes || 0)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="professional-card">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckSquare2 className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a task to view details
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Checklist */}
            {selectedTask && (
              <ChecklistManager
                taskId={selectedTask.id}
                checklistItems={selectedTask.checklist_items || []}
                onUpdate={(items) => {
                  const updatedTask = { ...selectedTask, checklist_items: items }
                  setSelectedTask(updatedTask)
                  setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t))
                }}
                isDemoMode={isDemoMode}
              />
            )}

            {/* Task Notes */}
            {selectedTask && (
              <TaskNotes
                notes={selectedTask.notes || []}
                onAddNote={handleAddNote}
                loading={notesLoading}
              />
            )}
          </div>
        </div>

        {/* Task Dialog */}
        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={(open) => {
            setTaskDialogOpen(open)
            if (!open) setEditingTask(null)
          }}
          task={editingTask}
          projectId={projectIdNum}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          loading={dialogLoading}
        />

        {/* Delete Dialog */}
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Task"
          description="This action cannot be undone. This will permanently delete the task and all its notes and time entries."
          itemName={taskToDelete?.name || ''}
          onConfirm={handleDeleteTask}
          loading={dialogLoading}
        />
      </div>
    </Layout>
  )
}