/**
 * Flow Diagram Component using React Flow
 * For creating flowcharts, node-based UIs, and process diagrams
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Panel,
  NodeToolbar,
  NodeResizer,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { theme } from '../theme';

// Custom Node Types
const nodeTypes = {
  default: ({ data, selected }) => (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-md border-2 transition-all duration-200
        ${selected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-blue-300'
        }
        ${data.style?.backgroundColor || 'bg-white'}
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <div className="text-sm font-medium text-gray-800">{data.label}</div>
      {data.description && (
        <div className="text-xs text-gray-500 mt-1">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  ),

  input: ({ data, selected }) => (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-md border-2 transition-all duration-200
        ${selected 
          ? 'border-green-500 shadow-lg ring-2 ring-green-200' 
          : 'border-green-300 hover:border-green-400'
        }
        bg-green-50
      `}
    >
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
      <div className="text-sm font-medium text-green-800">{data.label}</div>
      {data.description && (
        <div className="text-xs text-green-600 mt-1">{data.description}</div>
      )}
    </div>
  ),

  output: ({ data, selected }) => (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-md border-2 transition-all duration-200
        ${selected 
          ? 'border-amber-500 shadow-lg ring-2 ring-amber-200' 
          : 'border-amber-300 hover:border-amber-400'
        }
        bg-amber-50
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />
      <div className="text-sm font-medium text-amber-800">{data.label}</div>
      {data.description && (
        <div className="text-xs text-amber-600 mt-1">{data.description}</div>
      )}
    </div>
  ),

  decision: ({ data, selected }) => (
    <div
      className={`
        px-4 py-3 transform rotate-45 rounded-lg shadow-md border-2 transition-all duration-200
        ${selected 
          ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' 
          : 'border-purple-300 hover:border-purple-400'
        }
        bg-purple-50
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
      <div className="transform -rotate-45 text-sm font-medium text-purple-800 text-center">
        {data.label}
      </div>
    </div>
  ),

  process: ({ data, selected }) => (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-md border-2 transition-all duration-200
        ${selected 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
          : 'border-blue-300 hover:border-blue-400'
        }
        bg-blue-50
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
      <div className="text-sm font-medium text-blue-800">{data.label}</div>
      {data.description && (
        <div className="text-xs text-blue-600 mt-1">{data.description}</div>
      )}
    </div>
  ),

  database: ({ data, selected }) => (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-md border-2 transition-all duration-200
        ${selected 
          ? 'border-cyan-500 shadow-lg ring-2 ring-cyan-200' 
          : 'border-cyan-300 hover:border-cyan-400'
        }
        bg-cyan-50
      `}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-cyan-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-cyan-500" />
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        <div className="text-sm font-medium text-cyan-800">{data.label}</div>
      </div>
    </div>
  ),
};

// Edge Types
const edgeTypes = {
  default: {
    style: { stroke: theme.colors.secondary[400], strokeWidth: 2 },
    animated: false,
  },
  animated: {
    style: { stroke: theme.colors.primary[500], strokeWidth: 2 },
    animated: true,
  },
};

/**
 * Flow Diagram Component
 */
export const FlowDiagram = ({
  initialNodes = [],
  initialEdges = [],
  height = '600px',
  width = '100%',
  title,
  editable = true,
  minimap = true,
  controls = true,
  background = true,
  onNodeClick,
  onEdgeClick,
  onConnect,
  onNodesChange,
  onEdgesChange,
  className = '',
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);

  // Handle connections
  const onConnectInternal = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        style: { stroke: theme.colors.primary[500], strokeWidth: 2 },
        animated: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      if (onConnect) onConnect(params);
    },
    [setEdges, onConnect]
  );

  // Handle node click
  const onNodeClickInternal = useCallback((event, node) => {
    if (onNodeClick) onNodeClick(node);
  }, [onNodeClick]);

  // Handle edge click
  const onEdgeClickInternal = useCallback((event, edge) => {
    if (onEdgeClick) onEdgeClick(edge);
  }, [onEdgeClick]);

  // Handle nodes change
  const handleNodesChange = useCallback((changes) => {
    onNodesChangeInternal(changes);
    if (onNodesChange) onNodesChange(changes);
  }, [onNodesChangeInternal, onNodesChange]);

  // Handle edges change
  const handleEdgesChange = useCallback((changes) => {
    onEdgesChangeInternal(changes);
    if (onEdgesChange) onEdgesChange(changes);
  }, [onEdgesChangeInternal, onEdgesChange]);

  // Add new node
  const addNode = useCallback((type = 'default', position = { x: 100, y: 100 }, data = {}) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: { label: `New Node`, ...data },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Delete selected nodes
  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [setNodes, setEdges]);

  return (
    <div 
      className={`bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden ${className}`}
      style={{ height, width }}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div style={{ height: title ? 'calc(100% - 73px)' : '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnectInternal}
          onNodeClick={onNodeClickInternal}
          onEdgeClick={onEdgeClickInternal}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={editable}
          nodesConnectable={editable}
          elementsSelectable={editable}
        >
          {background && (
            <Background 
              color={theme.colors.secondary[300]} 
              gap={16} 
              size={1}
              variant="dots"
            />
          )}
          {controls && <Controls />}
          {minimap && (
            <MiniMap 
              nodeStrokeWidth={3}
              zoomable
              pannable
              style={{
                backgroundColor: theme.colors.secondary[50],
                border: `1px solid ${theme.colors.secondary[200]}`,
                borderRadius: '8px',
              }}
            />
          )}
          
          {editable && (
            <Panel position="top-right" className="flex gap-2">
              <button
                onClick={() => addNode('default')}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow-sm"
              >
                + Node
              </button>
              <button
                onClick={deleteSelected}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 shadow-sm"
              >
                Delete
              </button>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
};

/**
 * Simple Flow Diagram (read-only)
 */
export const SimpleFlowDiagram = ({
  nodes: initialNodes,
  edges: initialEdges,
  height = '400px',
  title,
  className = '',
}) => {
  return (
    <FlowDiagram
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      height={height}
      title={title}
      editable={false}
      className={className}
    />
  );
};

/**
 * Process Flow Diagram (pre-configured for process flows)
 */
export const ProcessFlowDiagram = ({
  steps = [],
  height = '500px',
  title = 'Process Flow',
  className = '',
}) => {
  const nodes = useMemo(() => {
    return steps.map((step, index) => ({
      id: `step-${index}`,
      type: index === 0 ? 'input' : index === steps.length - 1 ? 'output' : 'process',
      position: { x: 250, y: index * 100 },
      data: { 
        label: step.label,
        description: step.description,
      },
    }));
  }, [steps]);

  const edges = useMemo(() => {
    return steps.slice(0, -1).map((_, index) => ({
      id: `edge-${index}`,
      source: `step-${index}`,
      target: `step-${index + 1}`,
      type: 'smoothstep',
      animated: true,
    }));
  }, [steps]);

  return (
    <FlowDiagram
      initialNodes={nodes}
      initialEdges={edges}
      height={height}
      title={title}
      editable={false}
      className={className}
    />
  );
};

// Export node and edge types for custom usage
export { nodeTypes as NodeTypes, edgeTypes as EdgeTypes };

// Default export
export default FlowDiagram;
