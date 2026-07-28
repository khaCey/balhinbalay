import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const lastRouteKeyRef = useRef(`${location.pathname}${location.search}${location.hash}`);
  const value = {
    isLoginOpen: show,
    openLogin: () => setShow(true),
    closeLogin: () => setShow(false)
  };
  useEffect(() => {
    if (location.state?.openLogin) {
      setShow(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openLogin, location.pathname, navigate]);

  useEffect(() => {
    const nextRouteKey = `${location.pathname}${location.search}${location.hash}`;
    const didRouteChange = lastRouteKeyRef.current !== nextRouteKey;
    if (didRouteChange && show) {
      setShow(false);
    }
    lastRouteKeyRef.current = nextRouteKey;
  }, [location.pathname, location.search, location.hash, show]);
  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal show={show} onClose={() => setShow(false)} />
    </LoginModalContext.Provider>
  );
};
