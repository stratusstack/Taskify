
import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  ConnectionLineType,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TaskDependencyNode } from './TaskDependencyNode';
import { Task } from '@/types/task';

interface TaskDependenciesCanvasProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const nodeTypes = {
  taskNode: TaskDependencyNode,
};

export const TaskDependenciesCanvas: React.FC<TaskDependenciesCanvasProps> = ({
  tasks,
  onUpdateTask
}) => {
  // Create nodes from tasks
  const initialNodes: Node[] = useMemo(() => {
    return tasks.map((task, index) => ({
      id: task.id,
      type: 'taskNode',
      position: { 
        x: (index % 4) * 250 + 50, 
        y: Math.floor(index / 4) * 150 + 50 
      },
      data: {
        task,
        label: task.title,
        status: task.status,
        priority: task.priority,
      },
    }));
  }, [tasks]);

  // Create edges from task dependencies
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          // Only create edge if both tasks exist
          if (tasks.find(t => t.id === depId)) {
            edges.push({
              id: `${depId}-${task.id}`,
              source: depId,
              target: task.id,
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
              },
              style: {
                strokeWidth: 2,
                stroke: '#64748b',
              },
            });
          }
        });
      }
    });
    
    return edges;
  }, [tasks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when tasks change
  React.useEffect(() => {
    const updatedNodes = tasks.map((task, index) => ({
      id: task.id,
      type: 'taskNode',
      position: nodes.find(n => n.id === task.id)?.position || { 
        x: (index % 4) * 250 + 50, 
        y: Math.floor(index / 4) * 150 + 50 
      },
      data: {
        task,
        label: task.title,
        status: task.status,
        priority: task.priority,
      },
    }));
    setNodes(updatedNodes);
  }, [tasks, setNodes]);

  // Update edges when task dependencies change
  React.useEffect(() => {
    const updatedEdges: Edge[] = [];
    
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          if (tasks.find(t => t.id === depId)) {
            updatedEdges.push({
              id: `${depId}-${task.id}`,
              source: depId,
              target: task.id,
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
              },
              style: {
                strokeWidth: 2,
                stroke: '#64748b',
              },
            });
          }
        });
      }
    });
    
    setEdges(updatedEdges);
  }, [tasks, setEdges]);

  // Check for circular dependencies
  const wouldCreateCircularDependency = (sourceId: string, targetId: string): boolean => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      if (recursionStack.has(taskId)) return true;
      if (visited.has(taskId)) return false;

      visited.add(taskId);
      recursionStack.add(taskId);

      const task = tasks.find(t => t.id === taskId);
      if (task?.dependencies) {
        for (const depId of task.dependencies) {
          if (hasCycle(depId)) return true;
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    // Temporarily add the new dependency and check for cycles
    const targetTask = tasks.find(t => t.id === targetId);
    if (targetTask) {
      const tempDependencies = [...(targetTask.dependencies || []), sourceId];
      return tempDependencies.some(depId => {
        visited.clear();
        recursionStack.clear();
        return hasCycle(depId);
      });
    }

    return false;
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      
      // Prevent self-connection
      if (params.source === params.target) {
        console.warn('Cannot create dependency to self');
        return;
      }

      // Check for circular dependency
      if (wouldCreateCircularDependency(params.source, params.target)) {
        console.warn('Cannot create circular dependency');
        return;
      }

      // Update the target task's dependencies
      const targetTask = tasks.find(t => t.id === params.target);
      if (targetTask) {
        const updatedDependencies = [...(targetTask.dependencies || [])];
        if (!updatedDependencies.includes(params.source!)) {
          updatedDependencies.push(params.source!);
          onUpdateTask(params.target!, { dependencies: updatedDependencies });
        }
      }

      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          strokeWidth: 2,
          stroke: '#64748b',
        },
      }, eds));
    },
    [tasks, onUpdateTask, wouldCreateCircularDependency]
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    
    // Remove the dependency from the target task
    const targetTask = tasks.find(t => t.id === edge.target);
    if (targetTask && targetTask.dependencies) {
      const updatedDependencies = targetTask.dependencies.filter(depId => depId !== edge.source);
      onUpdateTask(edge.target, { dependencies: updatedDependencies });
    }

    // Remove the edge
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  }, [tasks, onUpdateTask, setEdges]);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeStrokeColor="#64748b"
          nodeColor="#e2e8f0"
          nodeBorderRadius={8}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};
