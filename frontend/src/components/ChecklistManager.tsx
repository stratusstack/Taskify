import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChecklistItem } from '@/types'
import { apiService } from '@/services/api'
import { toast } from 'sonner'
import {
  Plus,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react'

interface ChecklistManagerProps {
  taskId: number
  checklistItems?: ChecklistItem[]
  onUpdate?: (items: ChecklistItem[]) => void
  isDemoMode?: boolean
}

export function ChecklistManager({
  taskId,
  checklistItems = [],
  onUpdate,
  isDemoMode = false
}: ChecklistManagerProps) {
  const [items, setItems] = useState<ChecklistItem[]>(checklistItems)
  const [newItemText, setNewItemText] = useState('')
  const [addingItem, setAddingItem] = useState(false)

  useEffect(() => {
    setItems(checklistItems)
  }, [checklistItems])

  const handleAddItem = async () => {
    if (!newItemText.trim()) return

    if (isDemoMode) {
      toast.error('Demo mode: Cannot add checklist items')
      return
    }

    try {
      setAddingItem(true)
      const newItem = await apiService.createChecklistItem(taskId, newItemText.trim())
      const updatedItems = [...items, newItem]
      setItems(updatedItems)
      setNewItemText('')
      onUpdate?.(updatedItems)
      toast.success('Checklist item added!')
    } catch (error) {
      toast.error('Failed to add checklist item')
    } finally {
      setAddingItem(false)
    }
  }

  const handleToggleItem = async (item: ChecklistItem) => {
    if (isDemoMode) {
      toast.error('Demo mode: Cannot update checklist items')
      return
    }

    try {
      const updatedItem = await apiService.updateChecklistItem(item.id, {
        is_completed: !item.is_completed
      })
      const updatedItems = items.map(i => i.id === item.id ? updatedItem : i)
      setItems(updatedItems)
      onUpdate?.(updatedItems)
    } catch (error) {
      toast.error('Failed to update checklist item')
    }
  }

  const handleDeleteItem = async (item: ChecklistItem) => {
    if (isDemoMode) {
      toast.error('Demo mode: Cannot delete checklist items')
      return
    }

    try {
      await apiService.deleteChecklistItem(item.id)
      const updatedItems = items.filter(i => i.id !== item.id)
      setItems(updatedItems)
      onUpdate?.(updatedItems)
      toast.success('Checklist item deleted')
    } catch (error) {
      toast.error('Failed to delete checklist item')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem()
    }
  }

  const completedCount = items.filter(item => item.is_completed).length
  const totalCount = items.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Card className="professional-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Checklist
          </CardTitle>
          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} ({progressPercentage}%)
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add new item */}
        <div className="flex gap-2">
          <Input
            placeholder="Add item..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="professional-shadow-sm text-xs h-8"
            disabled={addingItem}
          />
          <Button
            onClick={handleAddItem}
            disabled={!newItemText.trim() || addingItem}
            size="sm"
            className="professional-btn h-8 w-8 p-0"
          >
            {addingItem ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Checklist items */}
        {items.length > 0 ? (
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 border border-border/30 hover:border-border/60 transition-colors group rounded-sm"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Checkbox
                    checked={item.is_completed}
                    onCheckedChange={() => handleToggleItem(item)}
                    className="h-4 w-4 shrink-0"
                  />
                  <span
                    className={`text-xs break-words leading-tight ${
                      item.is_completed
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item)}
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground mb-0.5">No checklist items yet</p>
            <p className="text-xs text-muted-foreground/70">Add items to track progress</p>
          </div>
        )}

        {/* Progress indicator */}
        {totalCount > 0 && (
          <div className="pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-muted/30 h-1.5 border border-border rounded-sm">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}