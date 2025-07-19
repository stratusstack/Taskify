
import React, { useState, useEffect } from 'react';
import { TaskTableView } from '@/components/TaskTableView';
import { TaskReport } from '@/components/TaskReport';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, Table } from 'lucide-react';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { Task, TaskTimeEntry } from '@/types/task';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeView, setActiveView] = useState<'table' | 'report'>('table');

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const createTask = (taskData: Omit<Task, 'id' | 'timeEntries'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      timeEntries: []
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates };
        
        // Handle state transitions and time tracking
        if (updates.status && updates.status !== task.status) {
          const now = new Date();
          
          // End current time entry if moving from "In Progress"
          if (task.status === 'In Progress') {
            const activeEntry = task.timeEntries.find(entry => !entry.endTime);
            if (activeEntry) {
              activeEntry.endTime = now;
            }
          }
          
          // Start new time entry if moving to "In Progress"
          if (updates.status === 'In Progress') {
            const newTimeEntry: TaskTimeEntry = {
              id: Date.now().toString(),
              startTime: now,
              date: now.toDateString()
            };
            updatedTask.timeEntries = [...task.timeEntries, newTimeEntry];
          }
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">Task Flow</h1>
              <p className="text-lg text-gray-600">Organize your work with style and efficiency</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant={activeView === 'table' ? 'default' : 'outline'}
                onClick={() => setActiveView('table')}
                className="gap-2 px-6"
              >
                <Table className="w-4 h-4" />
                Table
              </Button>
              <Button 
                variant={activeView === 'report' ? 'default' : 'outline'}
                onClick={() => setActiveView('report')}
                className="gap-2 px-6"
              >
                <BarChart3 className="w-4 h-4" />
                Reports
              </Button>
              {activeView === 'table' && (
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2 px-6">
                  <Plus className="w-4 h-4" />
                  New Task
                </Button>
              )}
            </div>
          </div>
        </header>

        {activeView === 'table' ? (
          <TaskTableView 
            tasks={tasks} 
            onUpdateTask={updateTask} 
            onDeleteTask={deleteTask}
          />
        ) : (
          <TaskReport tasks={tasks} />
        )}

        <CreateTaskDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateTask={createTask}
        />
      </div>
    </div>
  );
};

export default Index;
