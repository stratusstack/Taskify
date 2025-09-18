import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { TodoItem as TodoItemType } from '@/types'
import { Check, X, Edit2, Trash2 } from 'lucide-react'

interface TodoItemProps {
  item: TodoItemType
  onUpdate: (id: number, updates: Partial<TodoItemType>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export default function TodoItem({ item, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(item.text)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleComplete = async () => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await onUpdate(item.id, { is_completed: !item.is_completed })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditText(item.text)
  }

  const handleSaveEdit = async () => {
    if (isUpdating || editText.trim() === item.text) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    try {
      await onUpdate(item.id, { text: editText.trim() })
      setIsEditing(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditText(item.text)
  }

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await onDelete(item.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 bg-card border border-border professional-shadow rounded-md hover:border-primary/50 transition-all ${
      item.is_completed ? 'opacity-60' : ''
    }`}>
      <Checkbox
        checked={item.is_completed}
        onCheckedChange={handleToggleComplete}
        disabled={isUpdating}
        className="flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            autoFocus
            className="professional-input text-sm"
            disabled={isUpdating}
            maxLength={500}
          />
        ) : (
          <span
            className={`block text-sm cursor-pointer py-1 px-1 hover:bg-muted/30 rounded transition-colors ${
              item.is_completed ? 'line-through text-muted-foreground' : ''
            }`}
            onClick={handleStartEdit}
            title="Click to edit"
          >
            {item.text}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="professional-btn h-7 w-7 p-0 bg-green-500 hover:bg-green-600 text-white border-green-600"
              title="Save changes"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="professional-btn h-7 w-7 p-0 bg-gray-500 hover:bg-gray-600 text-white border-gray-600"
              title="Cancel editing"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              disabled={isUpdating}
              className="professional-btn h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-600"
              title="Edit item"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="professional-btn h-7 w-7 p-0 bg-red-500 hover:bg-red-600 text-white border-red-600"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}