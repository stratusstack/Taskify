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
    <div className={`flex items-center gap-2 p-2 bg-card border border-border group hover:border-primary/50 transition-colors ${
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
            className="brutalist-input text-sm"
            disabled={isUpdating}
            maxLength={500}
          />
        ) : (
          <span
            className={`block text-sm cursor-pointer py-1 ${
              item.is_completed ? 'line-through text-muted-foreground' : ''
            }`}
            onClick={handleStartEdit}
          >
            {item.text}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="brutalist-btn h-7 w-7 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="brutalist-btn h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              disabled={isUpdating}
              className="brutalist-btn h-7 w-7 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="brutalist-btn h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}