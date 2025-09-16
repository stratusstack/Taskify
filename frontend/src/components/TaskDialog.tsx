import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Task, TaskPriority, TaskStatus } from '@/types'
import { Loader2 } from 'lucide-react'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  projectId: number
  onSubmit: (data: {
    name: string
    description: string
    start_date: string
    end_date?: string
    status: TaskStatus
    priority: TaskPriority
    project_id: number
  }) => Promise<void>
  loading?: boolean
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Done', label: 'Done' }
]

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' }
]

export function TaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  projectId,
  onSubmit, 
  loading = false 
}: TaskDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<TaskStatus>('To Do')
  const [priority, setPriority] = useState<TaskPriority>('Medium')

  useEffect(() => {
    if (task) {
      setName(task.name)
      setDescription(task.description || '')
      setStartDate(task.start_date.split('T')[0])
      setEndDate(task.end_date ? task.end_date.split('T')[0] : '')
      setStatus(task.status)
      setPriority(task.priority)
    } else {
      // Reset form for new task
      setName('')
      setDescription('')
      setStartDate(new Date().toISOString().split('T')[0])
      setEndDate('')
      setStatus('To Do')
      setPriority('Medium')
    }
  }, [task, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const data = {
      name: name.trim(),
      description: description.trim(),
      start_date: new Date(startDate).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
      status,
      priority,
      project_id: projectId
    }

    await onSubmit(data)
    
    // Reset form
    if (!task) {
      setName('')
      setDescription('')
      setStartDate(new Date().toISOString().split('T')[0])
      setEndDate('')
      setStatus('To Do')
      setPriority('Medium')
    }
  }

  const isEditing = !!task

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] brutalist-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Make changes to your task here.' 
              : 'Add a new task to your project.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name *</Label>
            <Input
              id="task-name"
              placeholder="Enter task name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="brutalist-shadow-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="What needs to be done?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="brutalist-shadow-sm min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="brutalist-shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">Due Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="brutalist-shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                <SelectTrigger className="brutalist-shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
                <SelectTrigger className="brutalist-shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="brutalist-btn"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || loading}
              className="brutalist-btn"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}