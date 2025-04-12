// import React, { useCallback, useRef, useState, useEffect } from 'react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { DnDProvider } from './DnDContext';
import DnDFlow from './DnDFlow';

// import ReactFlow, { ... } from '@xyflow/react';
// import ReactFlow, { ... } from '@xyflow/react'

// Consolidated ReactFlow imports - removed duplicate imports
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Sidebar from './Sidebar';
import { DnDProvider, useDnD } from './DnDContext';
// Imports first
const express = require('express');

// Initialize app second
const app = express();

// Initial nodes
const initialNodes = [
  { id: 'Action 01', type: 'input', data: { label: 'Input Node' }, position: { x: 250, y: 5 } },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type, _] = useDnD();
  
  // New state for flow management
  const [flowName, setFlowName] = useState('New Flow');
  const [savedFlows, setSavedFlows] = useState([]);
  const [currentFlowId, setCurrentFlowId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Load saved flows on component mount
  useEffect(() => {
    fetchFlows();
  }, []);
  
  // Fetch all saved flows
  const fetchFlows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flows');
      const data = await response.json();
      setSavedFlows(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching flows:', error);
      setLoading(false);
    }
  };
  
  // Load a specific flow
  const loadFlow = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/flows/${id}`);
      const data = await response.json();
      
      setFlowName(data.name);
      setCurrentFlowId(data.id);
      
      // Parse the flow data
      const flowData = data.flow_data;
      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading flow:', error);
      setLoading(false);
    }
  };
  
  // Save current flow
  const saveFlow = async () => {
    try {
      setLoading(true);
      
      const flowData = {
        nodes,
        edges
      };
      
      const payload = {
        name: flowName,
        flow_data: flowData
      };
      
      let response;
      if (currentFlowId) {
        // Update existing flow
        response = await fetch(`/api/flows/${currentFlowId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new flow
        response = await fetch('/api/flows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
      
      const data = await response.json();
      setCurrentFlowId(data.id);
      
      // Refresh the list of flows
      fetchFlows();
      setLoading(false);
      alert('Flow saved successfully!');
    } catch (error) {
      console.error('Error saving flow:', error);
      setLoading(false);
      alert('Error saving flow. Please try again.');
    }
  };
  
  // Create a new flow
  const createNewFlow = () => {
    setNodes(initialNodes);
    setEdges([]);
    setFlowName('New Flow');
    setCurrentFlowId(null);
  };
  
  // Delete a flow
  const deleteFlow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flow?')) {
      return;
    }
    
    try {
      setLoading(true);
      await fetch(`/api/flows/${id}`, {
        method: 'DELETE',
      });
      
      if (currentFlowId === id) {
        createNewFlow();
      }
      
      // Refresh the list of flows
      fetchFlows();
      setLoading(false);
      alert('Flow deleted successfully!');
    } catch (error) {
      console.error('Error deleting flow:', error);
      setLoading(false);
      alert('Error deleting flow. Please try again.');
    }
  };
 
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
 
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
 
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
 
      // check if the dropped element is valid
      if (!type) {
        return;
      }
 
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };
 
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type, setNodes]
  );
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Flow management toolbar */}
      <div style={{ padding: '10px', background: '#f8f8f8', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center' }}>
        <input 
          type="text" 
          value={flowName} 
          onChange={(e) => setFlowName(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '200px' }}
        />
        <button onClick={saveFlow} disabled={loading} style={{ marginRight: '10px', padding: '5px 10px' }}>
          {loading ? 'Saving...' : 'Save Flow'}
        </button>
        <button onClick={createNewFlow} disabled={loading} style={{ marginRight: '10px', padding: '5px 10px' }}>
          New Flow
        </button>
        <select 
          disabled={loading} 
          value={currentFlowId || ''} 
          onChange={(e) => e.target.value && loadFlow(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', width: '200px' }}
        >
          <option value="">-- Select a flow --</option>
          {savedFlows.map(flow => (
            <option key={flow.id} value={flow.id}>{flow.name}</option>
          ))}
        </select>
        {currentFlowId && (
          <button onClick={() => deleteFlow(currentFlowId)} disabled={loading} style={{ padding: '5px 10px', color: 'red' }}>
            Delete
          </button>
        )}
      </div>
      
      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1 }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          style={{ flex: 1, backgroundColor: '#F7F9FB' }}
        >
          <Controls />
          <Background />
        </ReactFlow>
        <Sidebar />
      </div>
    </div>
  );
};

// Main App wrapped with providers
const App = () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);

export default App;