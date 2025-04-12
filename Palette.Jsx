import React from 'react';
import { useDnD } from './DnDContext';

// Action items for the palette
const actionItems = [
  { id: '1', action: 'Process Data', descr: 'Processes input data' },
  { id: '2', action: 'Make Decision', descr: 'Conditional branching' },
  { id: '3', action: 'Send Email', descr: 'Sends notification email' },
  { id: '4', action: 'API Call', descr: 'Makes external API request' },
  { id: '5', action: 'Transform Data', descr: 'Converts data format' }
];

const Palette = () => {
  const [_, setType] = useDnD();
  
  const onDragStart = (event, nodeType, data) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
    
    // You can store additional data if needed
    if (data) {
      event.dataTransfer.setData('application/reactflow', JSON.stringify(data));
    }
  };
  
  return (
    <aside className="palette">
      <div className="palette-header">
        <h3>Actions Palette</h3>
      </div>
      <div className="palette-actions">
        {/* Original node types */}
        <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input')} draggable>
          Input Node
        </div>
        <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
          Default Node
        </div>
        <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
          Output Node
        </div>
        
        {/* Action nodes */}
        <div className="palette-section">
          <h4>Actions</h4>
          {actionItems.map((action) => (
            <div
              key={action.id}
              className="palette-item"
              onDragStart={(event) => onDragStart(event, 'actionNode', action)}
              draggable
            >
              <div className="palette-item-label">{action.action}</div>
              <div className="palette-item-desc">{action.descr}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Palette;