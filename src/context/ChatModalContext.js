import React, { createContext, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatModalContext = createContext(null);

export function ChatModalProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const openChat = useCallback((property, threadIdOrNull) => {
    if (threadIdOrNull) {
      navigate(`/chat/${threadIdOrNull}`);
      return;
    }
    navigate('/messages');
  }, [navigate]);

  const closeChat = useCallback(() => {
    if (location.pathname.startsWith('/chat/')) {
      navigate('/messages');
    }
  }, [location.pathname, navigate]);

  const value = { isOpen: location.pathname.startsWith('/chat/'), openChat, closeChat };

  return (
    <ChatModalContext.Provider value={value}>
      {children}
    </ChatModalContext.Provider>
  );
}

export function useChatModal() {
  const ctx = useContext(ChatModalContext);
  if (!ctx) throw new Error('useChatModal must be used within ChatModalProvider');
  return ctx;
}
