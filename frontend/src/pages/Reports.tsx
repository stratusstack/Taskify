
import React, { useState, useEffect } from 'react';
import { TaskReport } from '@/components/TaskReport';
import { Navigation } from '@/components/Navigation';
import { Task } from '@/types/task';

const Reports = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      const migratedTasks = parsedTasks.map((task: any) => ({
        ...task,
        priority: task.priority || 'Medium',
        startDate: task.startDate ? new Date(task.startDate) : new Date(task.createdAt || Date.now()),
        timeEntries: task.timeEntries?.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined
        })) || [],
        projectId: task.projectId || 'personal'
      }));
      setTasks(migratedTasks);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Navigation />
        
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">
                Reports
              </h1>
              <p className="text-base sm:text-lg text-gray-600">Analyze your task performance and productivity</p>
            </div>
          </div>
        </header>

        <TaskReport tasks={tasks} />
      </div>
    </div>
  );
};

export default Reports;
