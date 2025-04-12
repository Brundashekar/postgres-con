import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component that displays data from the database
const TableNode = ({ data }) => {
  return (
    <div className="p-4 border rounded-md shadow-md bg-white">
      <div className="font-bold mb-2 text-lg">{data.label}</div>
      <div className="text-sm">
        {Object.entries(data.rowData || {}).map(([key, value]) => (
          <div key={key} className="grid grid-cols-2 gap-2 mb-1">
            <span className="font-medium">{key}:</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNode
};

const DnDFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/flow');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        
        // Convert the data into nodes for React Flow
        const newNodes = data.rows.map((row, index) => ({
          id: `node-${index}`,
          type: 'tableNode',
          data: { 
            label: `Row ${index + 1}`,
            rowData: row
          },
          position: { 
            x: 100 + (index % 3) * 350, 
            y: 100 + Math.floor(index / 3) * 200 
          },
          draggable: true
        }));
        
        // Create some example connections between nodes
        const newEdges = [];
        for (let i = 0; i < newNodes.length - 1; i++) {
          newEdges.push({
            id: `edge-${i}`,
            source: `node-${i}`,
            target: `node-${i + 1}`,
            animated: true
          });
        }
        
        setNodes(newNodes);
        setEdges(newEdges);
      } catch (err) {
        console.error('Error fetching flow data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading flow data...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-96 w-full border rounded">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default DnDFlow;