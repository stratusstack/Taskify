import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Task, TaskPriority, TaskStatus } from '@/types'
import { apiService } from '@/services/api'
import { ManualTimeDialog } from './ManualTimeDialog'
import {
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Play,
  Pause,
  MessageSquare,
  CheckSquare2,
  Zap,
  Flame,
  Trophy,
  Plus
} from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
  onTaskUpdate?: () => void
  onSelect?: (task: Task) => void
  isSelected?: boolean
}

const statusColors: Record<TaskStatus, string> = {
  'To Do': 'bg-gray-100 text-gray-800 border-gray-300',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
  'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Done': 'bg-green-100 text-green-800 border-green-300'
}


export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onTaskUpdate,
  onSelect,
  isSelected = false
}: TaskCardProps) {
  // Live timer state for "In Progress" tasks
  const [liveTimeMinutes, setLiveTimeMinutes] = useState(0)
  const [activeTimeEntry, setActiveTimeEntry] = useState<any>(null)
  const [displayTime, setDisplayTime] = useState(0)
  const [showManualTimeDialog, setShowManualTimeDialog] = useState(false)
  const [manualTimeLoading, setManualTimeLoading] = useState(false)

  // Fetch active time entry when task becomes "In Progress"
  useEffect(() => {
    const fetchActiveTimeEntry = async () => {
      if (task.status === 'In Progress') {
        try {
          // Check if there's an active time entry for this task
          const timeEntry = await apiService.getActiveTimeEntry(task.id)
          setActiveTimeEntry(timeEntry)
        } catch (error) {
          console.error('Failed to fetch active time entry:', error)
        }
      } else {
        setActiveTimeEntry(null)
        setLiveTimeMinutes(0)
      }
    }

    fetchActiveTimeEntry()
  }, [task.status, task.id])

  // Live timer effect - updates every minute when task is in progress
  useEffect(() => {
    if (task.status === 'In Progress' && activeTimeEntry) {
      const updateTimer = () => {
        const startTime = new Date(activeTimeEntry.start_time).getTime()
        const elapsedMs = Date.now() - startTime
        const elapsedMinutes = Math.floor(elapsedMs / 60000)
        setLiveTimeMinutes(elapsedMinutes)
      }

      updateTimer() // Initial update
      const interval = setInterval(updateTimer, 60000) // Update every minute

      return () => clearInterval(interval)
    } else {
      setLiveTimeMinutes(0)
    }
  }, [task.status, activeTimeEntry])

  // Calculate total time (base time + current session time for in-progress tasks)
  const actualTotalTime = task.status === 'In Progress'
    ? (task.total_time_minutes || 0) + liveTimeMinutes
    : (task.total_time_minutes || 0)

  // Animated counter effect - counts up to actual time
  useEffect(() => {
    if (actualTotalTime > 0) {
      const duration = 1500 // 1.5 seconds
      const steps = 30
      const increment = actualTotalTime / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= actualTotalTime) {
          setDisplayTime(actualTotalTime)
          clearInterval(timer)
        } else {
          setDisplayTime(Math.floor(current))
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    } else {
      setDisplayTime(0)
    }
  }, [actualTotalTime])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = task.end_date && new Date(task.end_date) < new Date() && task.status !== 'Done'
  const isInProgress = task.status === 'In Progress'

  // Time-based styling and icons
  const getTimeDisplayProps = (totalMinutes: number) => {
    const hours = totalMinutes / 60
    
    if (hours === 0) {
      return {
        icon: Clock,
        colorClass: 'text-muted-foreground',
        bgClass: 'bg-muted/30',
        borderClass: 'border-border'
      }
    } else if (hours < 1) {
      return {
        icon: Clock,
        colorClass: 'text-muted-foreground',
        bgClass: 'bg-muted/30',
        borderClass: 'border-border'
      }
    } else if (hours < 4) {
      return {
        icon: Zap,
        colorClass: 'text-primary',
        bgClass: 'bg-primary/10',
        borderClass: 'border-primary/20'
      }
    } else if (hours < 8) {
      return {
        icon: Flame,
        colorClass: 'text-secondary',
        bgClass: 'bg-secondary/10',
        borderClass: 'border-secondary/20'
      }
    } else {
      return {
        icon: Trophy,
        colorClass: 'text-accent',
        bgClass: 'bg-accent/10',
        borderClass: 'border-accent/20'
      }
    }
  }

  const timeProps = getTimeDisplayProps(actualTotalTime)

  // Priority styling for badges
  const getPriorityStyle = (priority: TaskPriority) => {
    const styles = {
      'Low': 'bg-gray-100 text-gray-700 border-gray-300',
      'Medium': 'bg-purple-100 text-purple-700 border-purple-300',
      'High': 'bg-orange-100 text-orange-700 border-orange-300',
      'Critical': 'bg-red-100 text-red-700 border-red-300'
    }
    return styles[priority]
  }

  // Handle manual time entry submission
  const handleManualTimeSubmit = async (minutes: number, date: string) => {
    setManualTimeLoading(true)
    try {
      await apiService.addManualTime(task.id, minutes, date)
      // Trigger parent component to refresh task data
      onTaskUpdate?.()
    } catch (error) {
      console.error('Failed to add manual time:', error)
      throw error // Re-throw to let the dialog handle the error
    } finally {
      setManualTimeLoading(false)
    }
  }

  return (
    <Card
      className={`brutalist-card transition-all duration-200 relative overflow-hidden cursor-pointer ${
        isInProgress ? 'task-wave-active' : ''
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onSelect?.(task)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-2 break-words">
              {task.name}
            </h3>

            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className={`${statusColors[task.status]}`}>
                {task.status}
              </Badge>

              <Badge variant="outline" className={`${getPriorityStyle(task.priority)}`}>
                {task.priority}
              </Badge>

              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onStatusChange(task, 'To Do')}
                disabled={task.status === 'To Do'}
              >
                <CheckSquare2 className="h-4 w-4 mr-2" />
                To Do
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => onStatusChange(task, 'In Progress')}
                disabled={task.status === 'In Progress'}
              >
                <Play className="h-4 w-4 mr-2" />
                In Progress
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => onStatusChange(task, 'On Hold')}
                disabled={task.status === 'On Hold'}
              >
                <Pause className="h-4 w-4 mr-2" />
                On Hold
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => onStatusChange(task, 'Done')}
                disabled={task.status === 'Done'}
              >
                <CheckSquare2 className="h-4 w-4 mr-2" />
                Done
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete(task)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Dates */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Start: {formatDate(task.start_date)}</span>
            </div>
            
            {task.end_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                  Due: {formatDate(task.end_date)}
                </span>
              </div>
            )}
          </div>

          {/* Notes and Timer Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              {/* Always show notes count, even if 0 */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{(task.notes?.length || 0)} note{(task.notes?.length || 0) !== 1 ? 's' : ''}</span>
              </div>
            </div>

          </div>

          {/* Animated Time Counter and Add Time Button - Bottom Right Corner */}
          <div className="flex justify-end items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 brutalist-btn"
              onClick={(e) => {
                e.stopPropagation()
                setShowManualTimeDialog(true)
              }}
              title="Add time manually"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <div className={`flex items-center gap-2 text-sm px-3 py-2 border-2 transition-all duration-500 ${timeProps.colorClass} ${timeProps.bgClass} ${timeProps.borderClass}`}>
              <timeProps.icon className="h-5 w-5" />
              <span className="font-bold text-lg transition-all duration-300 transform hover:scale-110">
                {formatTime(displayTime)}
              </span>
              {actualTotalTime > 60 && (
                <span className="text-xs opacity-75">
                  invested
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <ManualTimeDialog
        open={showManualTimeDialog}
        onOpenChange={setShowManualTimeDialog}
        onSubmit={handleManualTimeSubmit}
        loading={manualTimeLoading}
        taskName={task.name}
      />
    </Card>
  )
}