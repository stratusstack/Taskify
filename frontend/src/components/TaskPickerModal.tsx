import React, { useState } from 'react';
import { Task } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskPickerModalProps {
  tasks: Task[];
  selectedTasks: Task[];
  onSelectionChange: (tasks: Task[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskPickerModal: React.FC<TaskPickerModalProps> = ({
  tasks,
  selectedTasks,
  onSelectionChange,
  open,
  onOpenChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedTasks, setTempSelectedTasks] = useState<Task[]>(selectedTasks);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleTaskToggle = (task: Task, checked: boolean) => {
    if (checked && tempSelectedTasks.length < 5) {
      setTempSelectedTasks([...tempSelectedTasks, task]);
    } else if (!checked) {
      setTempSelectedTasks(tempSelectedTasks.filter(t => t.id !== task.id));
    }
  };

  const handleApply = () => {
    onSelectionChange(tempSelectedTasks);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempSelectedTasks(selectedTasks);
    onOpenChange(false);
  };

  const removeTask = (taskId: string) => {
    setTempSelectedTasks(tempSelectedTasks.filter(t => t.id !== taskId));
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Tasks for Chart (Max 5)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Tasks */}
          {tempSelectedTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Tasks ({tempSelectedTasks.length}/5)</h4>
              <div className="flex flex-wrap gap-2">
                {tempSelectedTasks.map((task) => (
                  <Badge
                    key={task.id}
                    variant="secondary"
                    className="flex items-center gap-2 pr-1"
                  >
                    {task.title}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTask(task.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Task List */}
          <ScrollArea className="flex-1 border rounded-md">
            <div className="p-4 space-y-2">
              {filteredTasks.map((task) => {
                const isSelected = tempSelectedTasks.some(t => t.id === task.id);
                const canSelect = !isSelected && tempSelectedTasks.length < 5;
                
                return (
                  <div
                    key={task.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleTaskToggle(task, checked as boolean)}
                      disabled={!isSelected && !canSelect}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{task.title}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(task.status)}`}
                        >
                          {task.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {task.description}
                        </p>
                      )}
                      {task.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {task.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {task.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{task.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found matching your search
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Selection ({tempSelectedTasks.length}/5)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};