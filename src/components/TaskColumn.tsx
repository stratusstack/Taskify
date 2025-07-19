
import React from 'react';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types/task';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  colorClass: string;
  textColorClass: string;
  onActivityClick?: (task: Task) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  tasks,
  onUpdateTask,
  onDeleteTask,
  colorClass,
  textColorClass,
  onActivityClick
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onUpdateTask(taskId, { status });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={`rounded-xl border-2 border-dashed p-6 ${colorClass}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-bold ${textColorClass}`}>{status}</h2>
          <div className={`text-sm font-medium px-3 py-1 rounded-full bg-white/80 ${textColorClass}`}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </div>
        </div>
      </div>
      
      <div 
        className="min-h-[200px]"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Drop tasks here or create a new one
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onActivityClick={onActivityClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
