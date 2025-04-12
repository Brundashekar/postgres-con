import { createContext, useContext, useState } from 'react';
import React, { createContext, useContext, useState } from 'react';


const DnDContext = createContext(null);
export const DnDProvider = ({ children }) => {
  const [type, setType] = useState(null);
  
export function DnDProvider({ children }) {
  const [type, setType] = useState(null);
  
  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
}

// Custom hook to use the context
export const useDnD = () => {
    const context = useContext(DnDContext);
    
    if (!context) {
      throw new Error('useDnD must be used within a DnDProvider');
    }
    
    return context;
  };