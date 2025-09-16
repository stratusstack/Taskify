import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { TaskNote } from '@/types'
import { MessageSquare, Plus, Loader2 } from 'lucide-react'

interface TaskNotesProps {
  notes: TaskNote[]
  onAddNote: (content: string) => Promise<void>
  loading?: boolean
}

export function TaskNotes({ notes, onAddNote, loading = false }: TaskNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      setIsAdding(true)
      await onAddNote(newNote.trim())
      setNewNote('')
    } finally {
      setIsAdding(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="brutalist-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes ({notes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new note */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="brutalist-shadow-sm"
            rows={3}
          />
          <Button
            onClick={handleAddNote}
            disabled={!newNote.trim() || isAdding || loading}
            className="brutalist-btn"
            size="sm"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Note
          </Button>
        </div>

        {/* Notes list */}
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-muted/50 border border-border p-3"
              >
                <p className="text-sm mb-2">{note.content}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(note.created_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet. Add your first note above.
          </p>
        )}
      </CardContent>
    </Card>
  )
}