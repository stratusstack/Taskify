import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Clock, MessageSquare, AlertCircle, Tag, Timer } from 'lucide-react';
import { Task, TaskActivity } from '@/types/task';
import { format } from 'date-fns';

interface TaskActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onAddActivity: (taskId: string, activity: Omit<TaskActivity, 'id' | 'timestamp'>) => void;
}

export const TaskActivityDialog: React.FC<TaskActivityDialogProps> = ({
  open,
  onOpenChange,
  task,
  onAddActivity,
}) => {
  const [newNote, setNewNote] = useState('');
  const [filter, setFilter] = useState<'all' | 'notes'>('all');

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddActivity(task.id, {
        type: 'note',
        description: newNote.trim(),
      });
      setNewNote('');
    }
  };

  const getActivityIcon = (type: TaskActivity['type']) => {
    switch (type) {
      case 'status_change':
        return <AlertCircle className="w-4 h-4" />;
      case 'note':
        return <MessageSquare className="w-4 h-4" />;
      case 'time_logged':
        return <Timer className="w-4 h-4" />;
      case 'priority_change':
        return <AlertCircle className="w-4 h-4" />;
      case 'tag_added':
      case 'tag_removed':
        return <Tag className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: TaskActivity['type']) => {
    switch (type) {
      case 'status_change':
        return 'bg-blue-100 text-blue-700';
      case 'note':
        return 'bg-green-100 text-green-700';
      case 'time_logged':
        return 'bg-purple-100 text-purple-700';
      case 'priority_change':
        return 'bg-orange-100 text-orange-700';
      case 'tag_added':
        return 'bg-cyan-100 text-cyan-700';
      case 'tag_removed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Activity Log - {task.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          {/* Add Note Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Add Note</h3>
            <Textarea
              placeholder="Add a note about this task..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="mb-2"
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              Add Note
            </Button>
          </div>

          {/* Activity Feed */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Activity History</h3>
              <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value as 'all' | 'notes')}>
                <ToggleGroupItem value="all" className="text-xs">
                  All History
                </ToggleGroupItem>
                <ToggleGroupItem value="notes" className="text-xs">
                  Notes Only
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <ScrollArea className="h-[400px] border rounded-lg p-4">
              {task.activities && task.activities.length > 0 ? (
                <div className="space-y-4">
                  {task.activities
                    .filter((activity) => filter === 'all' || activity.type === 'note')
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((activity) => (
                      <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-b-0">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No activity recorded yet
                </p>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};