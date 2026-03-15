import React, { createContext, useContext, useState, useCallback } from 'react';

const PropertyModalContext = createContext(null);

export function PropertyModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const setOpen = useCallback((open) => setIsOpen(!!open), []);

  return (
    <PropertyModalContext.Provider value={{ isPropertyModalOpen: isOpen, setPropertyModalOpen: setOpen }}>
      {children}
    </PropertyModalContext.Provider>
  );
}

export function usePropertyModal() {
  const ctx = useContext(PropertyModalContext);
  return ctx || { isPropertyModalOpen: false, setPropertyModalOpen: () => {} };
}
