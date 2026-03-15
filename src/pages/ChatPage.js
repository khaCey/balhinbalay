import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useListings } from '../context/ListingsContext';
import PageHeader from '../components/PageHeader';

export default function ChatPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getThreads, getMessagesByThreadId, sendMessage, loadMessagesForThreadId } = useChat();
  const { listings } = useListings();
  const [input, setInput] = useState('');
  const messagesListRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const baselineInnerHeightRef = useRef(typeof window !== 'undefined' ? window.innerHeight : 0);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [isComposerFocused, setIsComposerFocused] = useState(false);

  const threads = getThreads();
  const threadList = Array.isArray(threads) ? threads : [];
  const thread = threadList.find((t) => t.id === threadId);
  const allListings = Array.isArray(listings) ? listings : [];
  const property = thread ? allListings.find((l) => l.id === thread.listingId) || { id: thread.listingId, title: thread.listingTitle || 'Listing', images: [] } : null;

  const messages = threadId ? (getMessagesByThreadId(threadId) ?? []) : [];

  useEffect(() => {
    if (threadId) loadMessagesForThreadId(threadId);
  }, [threadId, loadMessagesForThreadId]);

  // Start at bottom immediately when opening/loading a thread.
  useLayoutEffect(() => {
    const list = messagesListRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [threadId, messages.length]);

  const scrollToBottom = () => {
    const list = messagesListRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  };

  // Mobile keyboard handling: keep header stable and only lift input above keyboard.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Fallback for webviews where visualViewport is missing/incomplete.
    const onWindowResize = () => {
      const current = window.innerHeight;
      const base = baselineInnerHeightRef.current || current;
      const estimatedInset = Math.max(0, base - current);
      setKeyboardInset((prev) => (Math.abs(prev - estimatedInset) > 2 ? estimatedInset : prev));
    };
    window.addEventListener('resize', onWindowResize);

    if (!window.visualViewport) {
      onWindowResize();
      return () => {
        window.removeEventListener('resize', onWindowResize);
      };
    }

    let raf = 0;
    const update = () => {
      raf = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        const inset = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
        setKeyboardInset((prev) => (Math.abs(prev - inset) > 2 ? inset : prev));
      });
    };
    update();
    window.visualViewport.addEventListener('resize', update);
    window.visualViewport.addEventListener('scroll', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onWindowResize);
      window.visualViewport.removeEventListener('resize', update);
      window.visualViewport.removeEventListener('scroll', update);
      setKeyboardInset(0);
    };
  }, []);

  const handleBack = () => navigate(-1);
  const activeInset = isComposerFocused ? keyboardInset : 0;

  // Keep latest message pinned above composer when keyboard inset changes.
  useEffect(() => {
    if (!isComposerFocused) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        scrollToBottom();
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
    };
  }, [activeInset, isComposerFocused]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !property || !user) return;
    sendMessage(property.id, text, user);
    setInput('');
    // Keep keyboard open after sending by restoring focus.
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      scrollToBottom();
    });
  };

  const formatTime = (ts) => {
    if (ts == null) return '';
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMinuteKey = (ts) => {
    if (ts == null) return null;
    const ms = new Date(ts).getTime();
    return Number.isNaN(ms) ? null : Math.floor(ms / 60000);
  };
  const showTimeForMessage = (msg, prevMsg) => {
    const key = getMinuteKey(msg.timestamp);
    if (key == null) return false;
    if (!prevMsg) return true;
    return getMinuteKey(prevMsg.timestamp) !== key;
  };

  if (!user) {
    return (
      <div className="page-with-header">
        <PageHeader title="Chat" onBack={handleBack} />
        <main className="page-content">
          <p className="text-muted">Please log in to view messages.</p>
        </main>
      </div>
    );
  }

  if (!thread || !property) {
    return (
      <div className="page-with-header">
        <PageHeader title="Chat" onBack={handleBack} />
        <main className="page-content">
          <p className="text-muted">Conversation not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="chat-page page-with-header">
      <PageHeader
        title={property.title}
        onBack={handleBack}
        className="chat-page-header"
      />
      <main className="page-content chat-page-body">
        <div
          ref={messagesListRef}
          className="chat-panel-messages chat-page-messages"
          style={activeInset > 0 ? { paddingBottom: 12 + activeInset } : undefined}
        >
          {messages.length === 0 && (
            <p className="chat-panel-placeholder">
              Start the conversation. Messages are stored in this app.
            </p>
          )}
          {messages.map((msg, idx) => {
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showTime = showTimeForMessage(msg, prevMsg);
            const isMe = msg.isFromUser;
            return (
              <div
                key={msg.id}
                className={`chat-panel-message-row ${isMe ? 'chat-panel-message-row-me' : 'chat-panel-message-row-them'}`}
              >
                {!isMe && (
                  <span className="chat-panel-time-outside">
                    {showTime ? formatTime(msg.timestamp) : '\u00A0'}
                  </span>
                )}
                <div
                  className={`chat-panel-bubble ${isMe ? 'chat-panel-bubble-me' : 'chat-panel-bubble-them'}`}
                >
                  {!isMe && msg.senderName && <span className="chat-panel-sender">{msg.senderName}</span>}
                  <p className="chat-panel-text">{msg.text}</p>
                </div>
                {isMe && (
                  <span className="chat-panel-time-outside">
                    {showTime ? formatTime(msg.timestamp) : '\u00A0'}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form
          className="chat-panel-form chat-page-form"
          onSubmit={handleSubmit}
          style={activeInset > 0 ? { transform: `translateY(-${activeInset}px)` } : undefined}
        >
          <input
            ref={inputRef}
            type="text"
            className="chat-panel-input"
            placeholder="Message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => {
              setIsComposerFocused(true);
              scrollToBottom();
            }}
            onBlur={() => setIsComposerFocused(false)}
            aria-label="Message"
          />
          <button
            type="submit"
            className="chat-panel-send"
            aria-label="Send"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            <i className="fas fa-paper-plane" aria-hidden />
          </button>
        </form>
      </main>
    </div>
  );
}
