
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TaskTableView } from '@/components/TaskTableView';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskDependenciesCanvas } from '@/components/TaskDependenciesCanvas';
import { Network, Kanban, Settings } from 'lucide-react';
import { Task } from '@/types/task';
import { ProjectColumnConfig } from '@/components/ProjectConfigDialog';

interface ProjectTasksTabsProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  columnConfig: ProjectColumnConfig;
  onActivityClick?: (task: Task) => void;
  onConfigureColumns: () => void;
}

export const ProjectTasksTabs: React.FC<ProjectTasksTabsProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
  columnConfig,
  onActivityClick,
  onConfigureColumns,
}) => {
  return (
    <Tabs defaultValue="table" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
        <TabsTrigger value="table" className="text-sm">
          <span className="hidden sm:inline">Task List</span>
          <span className="sm:hidden">Table</span>
        </TabsTrigger>
        <TabsTrigger value="kanban" className="gap-1 sm:gap-2 text-sm">
          <Kanban className="w-4 h-4" />
          <span className="hidden sm:inline">Kanban Board</span>
          <span className="sm:hidden">Kanban</span>
        </TabsTrigger>
        <TabsTrigger value="dependencies" className="gap-1 sm:gap-2 text-sm">
          <Network className="w-4 h-4" />
          <span className="hidden sm:inline">Dependencies Canvas</span>
          <span className="sm:hidden">Canvas</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="table">
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={onConfigureColumns} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Configure Columns
            </Button>
          </div>
          <TaskTableView 
            tasks={tasks} 
            onUpdateTask={onUpdateTask} 
            onDeleteTask={onDeleteTask}
            columnConfig={columnConfig}
            onActivityClick={onActivityClick}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="kanban">
        <TaskBoard 
          tasks={tasks} 
          onUpdateTask={onUpdateTask} 
          onDeleteTask={onDeleteTask}
          onActivityClick={onActivityClick}
        />
      </TabsContent>
      
      <TabsContent value="dependencies">
        <div className="space-y-4">
          <div className="text-sm text-gray-600 px-2 sm:px-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>
              <span>Left handle: Accepts incoming dependencies</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              <span>Right handle: Creates outgoing connections</span>
            </div>
            <p>Drag from a right handle to a left handle to create dependencies. Circular dependencies are prevented automatically.</p>
          </div>
          <div className="overflow-hidden rounded-lg border bg-white">
            <TaskDependenciesCanvas 
              tasks={tasks} 
              onUpdateTask={onUpdateTask}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
