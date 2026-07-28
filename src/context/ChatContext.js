import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { api, getToken, baseUrl } from '../api/client';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

const TOAST_DURATION_MS = 4000;
const DEFAULT_CHAT_ERROR = 'Unable to send message. Please try again.';

function getChatErrorMessage(err, fallback = DEFAULT_CHAT_ERROR) {
  return err?.userMessage || err?.message || fallback;
}

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [messagesCache, setMessagesCache] = useState({});
  const [inAppNotification, setInAppNotification] = useState(null);

  const fetchThreads = useCallback(async () => {
    if (!user) {
      setThreads([]);
      setMessagesCache({});
      return;
    }
    try {
      const data = await api.get('/api/chat/threads');
      const list = Array.isArray(data) ? data : [];
      setThreads(list.map((t) => ({
        id: t.id,
        listingId: t.listingId,
        listingTitle: t.listingTitle,
        userId: t.userId,
        listingOwnerId: t.listingOwnerId,
        otherParticipantName: t.otherParticipantName,
        updatedAt: t.updatedAt,
        unreadCount: t.unreadCount != null ? t.unreadCount : 0,
        lastMessage: t.lastMessage || null
      })));
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  /* Refetch threads when user returns to the tab so unread badge updates */
  useEffect(() => {
    if (!user) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchThreads();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [user, fetchThreads]);

  /* SSE: receive threads_updated when someone sends a message; refetch threads and optionally reconnect on close */
  const fetchThreadsRef = useRef(fetchThreads);
  fetchThreadsRef.current = fetchThreads;
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;
    let aborted = false;
    let reconnectTimeout = null;
    let currentAc = null;
    const RECONNECT_DELAY = 3000;

    const connect = (delay = 0) => {
      if (aborted) return;
      const run = () => {
        if (aborted) return;
        currentAc = new AbortController();
        const url = (baseUrl || '') + '/api/chat/events';
        const opts = { headers: { Authorization: 'Bearer ' + getToken() }, signal: currentAc.signal };
        fetch(url, opts)
          .then((res) => {
            if (aborted) return;
            if (!res.ok) {
              reconnectTimeout = setTimeout(() => connect(RECONNECT_DELAY), RECONNECT_DELAY);
              return;
            }
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buf = '';
            const processLine = (line) => {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'threads_updated') {
                    fetchThreadsRef.current();
                    const at = Date.now();
                    setInAppNotification({ message: 'New message', at });
                    setTimeout(() => setInAppNotification((prev) => (prev?.at === at ? null : prev)), TOAST_DURATION_MS);
                  }
                } catch (_) {}
              }
            };
            const read = () => {
              if (aborted) return;
              reader.read()
                .then(({ done, value }) => {
                  if (aborted) return;
                  if (done) {
                    reconnectTimeout = setTimeout(() => connect(RECONNECT_DELAY), RECONNECT_DELAY);
                    return;
                  }
                  buf += decoder.decode(value, { stream: true });
                  const parts = buf.split('\n\n');
                  buf = parts.pop() || '';
                  parts.forEach((block) => {
                    block.split('\n').forEach(processLine);
                  });
                  read();
                })
                .catch((err) => {
                  if (aborted || err?.name === 'AbortError') return;
                  if (!aborted) reconnectTimeout = setTimeout(() => connect(RECONNECT_DELAY), RECONNECT_DELAY);
                });
            };
            read();
          })
          .catch((err) => {
            if (!aborted) reconnectTimeout = setTimeout(() => connect(RECONNECT_DELAY), RECONNECT_DELAY);
          });
      };
      if (delay > 0) reconnectTimeout = setTimeout(run, delay);
      else run();
    };

    connect();
    return () => {
      aborted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (currentAc) currentAc.abort();
    };
  }, [user]);

  const fetchMessagesForThread = useCallback(
    async (threadId) => {
      if (!threadId) return;
      try {
        const data = await api.get('/api/chat/threads/' + threadId + '/messages');
        setMessagesCache((prev) => ({ ...prev, [threadId]: Array.isArray(data) ? data : [] }));
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const markThreadRead = useCallback(
    async (threadId) => {
      if (!threadId) return;
      try {
        await api.post('/api/chat/threads/' + threadId + '/read');
        await fetchThreads();
      } catch (err) {
        console.error(err);
      }
    },
    [fetchThreads]
  );

  const loadMessagesForListing = useCallback(
    async (listingId) => {
      const matching = threads.filter((t) => t.listingId === listingId);
      const thread = matching.length === 0 ? null : matching.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
      if (!thread) return;
      await fetchMessagesForThread(thread.id);
      await markThreadRead(thread.id);
    },
    [threads, fetchMessagesForThread, markThreadRead]
  );

  const getMessages = useCallback(
    (listingId) => {
      const matching = threads.filter((t) => t.listingId === listingId);
      const thread = matching.length === 0 ? null : matching.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
      if (!thread) return [];
      const raw = messagesCache[thread.id] || [];
      return raw.map((m) => ({
        id: m.id,
        listingId,
        senderId: m.senderId,
        text: m.text,
        timestamp: m.createdAt,
        isFromUser: m.senderId === user?.id
      }));
    },
    [threads, messagesCache, user?.id]
  );

  const getThreadListingIds = useCallback(() => threads.map((t) => t.listingId), [threads]);

  const getThreads = useCallback(() => threads, [threads]);

  const getMessagesByThreadId = useCallback(
    (threadId) => {
      const raw = messagesCache[threadId] || [];
      return raw.map((m) => ({
        id: m.id,
        listingId: threads.find((t) => t.id === threadId)?.listingId,
        senderId: m.senderId,
        text: m.text,
        timestamp: m.createdAt,
        isFromUser: m.senderId === user?.id
      }));
    },
    [messagesCache, threads, user?.id]
  );

  const loadMessagesForThreadId = useCallback(
    async (threadId) => {
      if (!threadId) return;
      await fetchMessagesForThread(threadId);
      await markThreadRead(threadId);
    },
    [fetchMessagesForThread, markThreadRead]
  );

  const getUnreadCount = useCallback(
    () => threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0),
    [threads]
  );

  const unreadCount = useMemo(
    () => threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0),
    [threads]
  );

  const unreadChatCount = useMemo(
    () => threads.filter((t) => (t.unreadCount || 0) > 0).length,
    [threads]
  );

  const markThreadReadByListingId = useCallback(
    async (listingId) => {
      const matching = threads.filter((t) => t.listingId === listingId);
      const thread = matching.length === 0 ? null : matching.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
      if (thread) await markThreadRead(thread.id);
    },
    [threads, markThreadRead]
  );

  const sendMessageByThreadId = useCallback(
    async (threadId, text, senderUser) => {
      const normalizedText = String(text || '').trim();
      if (!threadId || !normalizedText || !senderUser) {
        return { ok: false, error: 'Message cannot be empty.' };
      }
      try {
        await api.post('/api/chat/threads/' + threadId + '/messages', { text: normalizedText });
        await Promise.all([fetchMessagesForThread(threadId), fetchThreads()]);
        return { ok: true };
      } catch (err) {
        console.error(err);
        return { ok: false, error: getChatErrorMessage(err) };
      }
    },
    [fetchMessagesForThread, fetchThreads]
  );

  const sendMessage = useCallback(
    async (listingId, text, senderUser) => {
      if (!text?.trim() || !senderUser) return { ok: false, error: 'Message cannot be empty.' };
      try {
        const matching = threads.filter((t) => t.listingId === listingId);
        const asInquirer = matching.find((t) => t.userId === senderUser.id);
        let thread = asInquirer || (matching.length > 0 ? matching.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0] : null);
        if (!thread) {
          const created = await api.post('/api/chat/threads', { listingId });
          thread = {
            id: created.id,
            listingId: created.listingId || listingId,
            listingTitle: created.listingTitle || '',
            userId: senderUser.id,
            listingOwnerId: created.listingOwnerId,
            updatedAt: created.updatedAt
          };
          setThreads((prev) => {
            if (prev.some((t) => t.id === thread.id)) return prev;
            return [thread, ...prev];
          });
        }
        return sendMessageByThreadId(thread.id, text, senderUser);
      } catch (err) {
        console.error(err);
        return { ok: false, error: getChatErrorMessage(err) };
      }
    },
    [threads, sendMessageByThreadId]
  );

  const createOrGetThread = useCallback(
    async (listingId) => {
      if (!user) return null;
      const matching = threads.filter((t) => t.listingId === listingId);
      const existing = matching.length > 0 ? matching.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0] : null;
      if (existing) return existing.id;
      try {
        const created = await api.post('/api/chat/threads', { listingId });
        await fetchThreads();
        return created.id;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [user, threads, fetchThreads]
  );

  const value = {
    getMessages,
    getThreadListingIds,
    getThreads,
    getMessagesByThreadId,
    loadMessagesForThreadId,
    getUnreadCount,
    unreadCount,
    unreadChatCount,
    markThreadRead,
    markThreadReadByListingId,
    sendMessage,
    sendMessageByThreadId,
    loadMessagesForListing,
    createOrGetThread,
    refreshThreads: fetchThreads,
    inAppNotification
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
      {inAppNotification && (
        <div
          className="chat-in-app-toast"
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            padding: '10px 16px',
            borderRadius: 8,
            background: 'var(--bs-dark, #212529)',
            color: '#fff',
            fontSize: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            maxWidth: '90vw'
          }}
        >
          {inAppNotification.message}
        </div>
      )}
    </ChatContext.Provider>
  );
};
