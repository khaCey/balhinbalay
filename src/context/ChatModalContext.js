import React, { createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatModalContext = createContext(null);

export function ChatModalProvider({ children }) {
  const navigate = useNavigate();

  const openChat = useCallback((property, threadIdOrNull) => {
    if (threadIdOrNull) navigate(`/chat/${threadIdOrNull}`);
  }, [navigate]);

  const closeChat = useCallback(() => {}, []);

  const value = { isOpen: false, openChat, closeChat };

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
