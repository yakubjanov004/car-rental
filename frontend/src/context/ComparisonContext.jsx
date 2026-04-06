import React, { createContext, useContext, useState, useEffect } from 'react';

const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
  const [comparisonList, setComparisonList] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('ridelux_comparison');
    if (saved) {
      try {
        setComparisonList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load comparison list", e);
      }
    }
  }, []);

  const addToComparison = (car) => {
    if (comparisonList.length >= 4) {
      alert("Maksimal 4 ta mashinani solishtirish mumkin.");
      return;
    }
    if (comparisonList.find(c => c.id === car.id)) return;
    
    const newList = [...comparisonList, car];
    setComparisonList(newList);
    localStorage.setItem('ridelux_comparison', JSON.stringify(newList));
  };

  const removeFromComparison = (id) => {
    const newList = comparisonList.filter(c => c.id !== id);
    setComparisonList(newList);
    localStorage.setItem('ridelux_comparison', JSON.stringify(newList));
  };

  const clearComparison = () => {
    setComparisonList([]);
    localStorage.removeItem('ridelux_comparison');
  };

  const isInComparison = (id) => comparisonList.some(c => c.id === id);

  return (
    <ComparisonContext.Provider value={{ 
      comparisonList, 
      addToComparison, 
      removeFromComparison, 
      clearComparison,
      isInComparison 
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => useContext(ComparisonContext);
