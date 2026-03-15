import React, { createContext, useContext, useState, useCallback } from 'react';

const SliderDragContext = createContext(null);

export function useSliderDrag() {
  const ctx = useContext(SliderDragContext);
  return ctx || { isSliding: false, setSliding: () => {} };
}

export function SliderDragProvider({ children }) {
  const [isSliding, setIsSliding] = useState(false);
  const setSliding = useCallback((value) => {
    setIsSliding(Boolean(value));
  }, []);

  const value = { isSliding, setSliding };
  return (
    <SliderDragContext.Provider value={value}>
      {children}
    </SliderDragContext.Provider>
  );
}
