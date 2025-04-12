export const defaultEdges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3', animated: true },
    
  ];
// Custom edge component
const CustomEdge = ({ id, source, target, ...props }) => {
  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={`M${props.sourceX},${props.sourceY} C ${props.sourceX} ${props.sourceY + 50}, ${props.targetX} ${props.targetY - 50}, ${props.targetX},${props.targetY}`}
      stroke="#555"
      strokeWidth={2}
      fill="none"
    />
  );
};

// Edge types
export const edgeTypes = {
  custom: CustomEdge,
};

// Initial edges
export const initialEdges = [];
