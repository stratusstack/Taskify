import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { HitList, TodoItem as TodoItemType } from '@/types'
import { apiService } from '@/services/api'
import TodoItem from '@/components/TodoItem'
import { Plus, ListTodo } from 'lucide-react'
import { toast } from 'sonner'

interface TodoListProps {
  className?: string
  showTitle?: boolean
}

export default function TodoList({ className = '', showTitle = true }: TodoListProps) {
  const { user } = useAuth()
  const [hitList, setHitList] = useState<HitList | null>(null)
  const [newItemText, setNewItemText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingItem, setIsAddingItem] = useState(false)

  // Fetch hit list on component mount
  useEffect(() => {
    if (user) {
      fetchHitList()
    }
  }, [user])

  const fetchHitList = async () => {
    try {
      const data = await apiService.getHitList()
      setHitList(data)
    } catch (error) {
      console.error('Error fetching hit list:', error)
      toast.error('Failed to load todo list')
    } finally {
      setIsLoading(false)
    }
  }


  const addTodoItem = async () => {
    if (!newItemText.trim() || isAddingItem) return

    setIsAddingItem(true)
    try {
      await apiService.addTodoItem(newItemText.trim())

      // Refresh the hit list to get the updated data
      await fetchHitList()

      setNewItemText('')
      toast.success('Todo item added')
    } catch (error) {
      console.error('Error adding todo item:', error)
      toast.error('Failed to add todo item')
    } finally {
      setIsAddingItem(false)
    }
  }

  const updateTodoItem = async (itemId: number, updates: Partial<TodoItemType>) => {
    if (!hitList) return

    try {
      const updatedItem = await apiService.updateTodoItem(itemId, updates)
      setHitList(prev => ({
        ...prev!,
        items: prev!.items!.map(item =>
          item.id === itemId ? updatedItem : item
        )
      }))

      if (updates.is_completed !== undefined) {
        toast.success(updates.is_completed ? 'Todo completed!' : 'Todo marked incomplete')
      }
    } catch (error) {
      console.error('Error updating todo item:', error)
      toast.error('Failed to update todo item')
    }
  }

  const deleteTodoItem = async (itemId: number) => {
    if (!hitList) return

    try {
      await apiService.deleteTodoItem(itemId)
      setHitList(prev => ({
        ...prev!,
        items: prev!.items!.filter(item => item.id !== itemId)
      }))
      toast.success('Todo item deleted')
    } catch (error) {
      console.error('Error deleting todo item:', error)
      toast.error('Failed to delete todo item')
    }
  }


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodoItem()
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <Card className="professional-card">
          <CardHeader className="pb-3">
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show add form even if no items exist (hit list will be auto-created)
  if (!hitList || !hitList.items || hitList.items.length === 0) {
    return (
      <div className={className}>
        <Card className="professional-card">
          {showTitle && (
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                Hit List
              </CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Add your first todo item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAddingItem}
                className="professional-input flex-1"
                maxLength={500}
              />
              <Button
                onClick={addTodoItem}
                disabled={!newItemText.trim() || isAddingItem}
                className="professional-btn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card className="professional-card">
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              Hit List
              <span className="text-sm font-normal text-muted-foreground">
                ({hitList.items.filter(item => !item.is_completed).length} remaining)
              </span>
            </CardTitle>
          </CardHeader>
        )}

        <CardContent className="pt-3">
          <div className="space-y-2">
            {/* Add new item */}
            <div className="flex gap-2">
              <Input
                placeholder="Add new todo item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAddingItem}
                className="professional-input flex-1"
                maxLength={500}
              />
              <Button
                onClick={addTodoItem}
                disabled={!newItemText.trim() || isAddingItem}
                className="professional-btn"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Todo items */}
            <div className="space-y-1">
              {hitList.items
                .sort((a, b) => {
                  // Show incomplete items first, then completed ones
                  if (a.is_completed !== b.is_completed) {
                    return a.is_completed ? 1 : -1
                  }
                  // Within same completion status, sort by sort_order then creation date
                  if (a.sort_order !== b.sort_order) {
                    return a.sort_order - b.sort_order
                  }
                  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                })
                .map((item) => (
                  <TodoItem
                    key={item.id}
                    item={item}
                    onUpdate={updateTodoItem}
                    onDelete={deleteTodoItem}
                  />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}