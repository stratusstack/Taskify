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
import { Project } from '@/types'
import { Loader2 } from 'lucide-react'

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
  onSubmit: (data: { name: string; description: string }) => Promise<void>
  loading?: boolean
}

export function ProjectDialog({ 
  open, 
  onOpenChange, 
  project, 
  onSubmit, 
  loading = false 
}: ProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
    } else {
      setName('')
      setDescription('')
    }
  }, [project, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    await onSubmit({ name: name.trim(), description: description.trim() })
    
    // Reset form
    setName('')
    setDescription('')
  }

  const isEditing = !!project

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] brutalist-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Make changes to your project here.' 
              : 'Add a new project to organize your tasks.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="Enter project name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="brutalist-shadow-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="brutalist-shadow-sm min-h-[80px]"
            />
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
              {isEditing ? 'Update Project' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}