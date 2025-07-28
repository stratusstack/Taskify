
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Task, TaskStatus } from '@/types/task';
import { Clock, Edit, Save, X, Plus } from 'lucide-react';

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  task,
  open,
  onOpenChange,
  onUpdateTask
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [tags, setTags] = useState<string[]>(task.tags);
  const [newTag, setNewTag] = useState('');

  const getTotalTimeSpent = () => {
    return task.time_entries.reduce((total, entry) => {
      if (entry.end_time) {
        const diff = new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime();
        return total + Math.floor(diff / 1000 / 60);
      }
      return total;
    }, 0);
  };

  const getCurrentTimeSpent = () => {
    if (task.status === 'in_progress') {
      const activeEntry = task.time_entries.find(entry => !entry.end_time);
      if (activeEntry) {
        const now = new Date();
        const diff = now.getTime() - new Date(activeEntry.start_time).getTime();
        return Math.floor(diff / 1000 / 60);
      }
    }
    return 0;
  };

  const handleSave = () => {
    onUpdateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      tags
    });
    setIsEditing(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Task Details</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label>Title</Label>
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            ) : (
              <h3 className="text-lg font-medium mt-1">{task.title}</h3>
            )}
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Badge className="mt-1 block w-fit">{task.status}</Badge>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            {isEditing ? (
              <>
                <div className="flex gap-2 mt-1 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {task.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description..."
                rows={6}
                className="mt-1"
              />
            ) : (
              <div className="mt-1 p-3 bg-gray-50 rounded-md min-h-[100px]">
                {task.description ? (
                  <div className="whitespace-pre-wrap text-sm text-gray-700">
                    {task.description}
                  </div>
                ) : (
                  <span className="text-gray-500">No description provided</span>
                )}
              </div>
            )}
          </div>

          {/* Time Tracking */}
          <div>
            <Label>Time Tracking</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Total time: {formatDuration(getTotalTimeSpent())}</span>
                {getCurrentTimeSpent() > 0 && (
                  <span className="text-blue-600">
                    (Currently active: {formatDuration(getCurrentTimeSpent())})
                  </span>
                )}
              </div>
              
              {task.time_entries.length > 0 && (
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-1">Time entries:</div>
                  {task.time_entries.map(entry => (
                    <div key={entry.id} className="ml-4 text-xs">
                      {entry.date}: {new Date(entry.start_time).toLocaleTimeString()}
                      {entry.end_time && (
                        <>
                          {' - '}
                          {new Date(entry.end_time).toLocaleTimeString()}
                          {' ('}
                          {formatDuration(
                            Math.floor(
                              (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000 / 60
                            )
                          )}
                          {')'}
                        </>
                      )}
                      {!entry.end_time && ' - Active'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
