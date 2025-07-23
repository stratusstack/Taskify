
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
  statusIcon: string;
  onActivityClick?: (task: Task) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  tasks,
  onUpdateTask,
  onDeleteTask,
  colorClass,
  textColorClass,
  statusIcon,
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
    <div className={`group relative overflow-hidden rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 ${colorClass}`}>
      {/* Header Section */}
      <div className="relative px-6 py-5 border-b border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{statusIcon}</div>
            <div>
              <h2 className={`text-xl font-bold ${textColorClass}`}>{status}</h2>
              <p className={`text-sm opacity-80 ${textColorClass}`}>
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-2 rounded-xl bg-white/30 backdrop-blur-sm font-semibold text-sm ${textColorClass} border border-white/20`}>
            {tasks.length}
          </div>
        </div>
        
        {/* Decorative line */}
        <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>
      
      {/* Content Section */}
      <div 
        className="p-6 min-h-[300px] relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <div className="text-2xl opacity-60">{statusIcon}</div>
            </div>
            <p className={`font-medium mb-2 ${textColorClass}`}>No tasks yet</p>
            <p className="text-sm opacity-70 text-gray-600">
              Drop tasks here or create a new one
            </p>
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
        
        {/* Background decoration */}
        <div className="absolute top-4 right-4 text-6xl opacity-5 pointer-events-none">
          {statusIcon}
        </div>
      </div>
    </div>
  );
};
