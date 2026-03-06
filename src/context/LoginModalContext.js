import React, { createContext, useContext, useState } from 'react';
import LoginModal from '../components/LoginModal';

const LoginModalContext = createContext();

export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within LoginModalProvider');
  }
  return context;
};

export const LoginModalProvider = ({ children }) => {
  const [show, setShow] = useState(false);
  const value = {
    openLogin: () => setShow(true),
    closeLogin: () => setShow(false)
  };
  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal show={show} onClose={() => setShow(false)} />
    </LoginModalContext.Provider>
  );
};
