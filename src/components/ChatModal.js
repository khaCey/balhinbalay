import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';

const ChatModal = ({ show, onClose, property, threadId, user, onBack }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { getMessages, getMessagesByThreadId, sendMessage, loadMessagesForListing, loadMessagesForThreadId } = useChat();
  /* Mobile: resize panel to visual viewport so header stays fixed when keyboard opens */
  const [viewportSize, setViewportSize] = useState(null);

  const messages = threadId
    ? (getMessagesByThreadId(threadId) ?? [])
    : (property ? getMessages(property.id) : []);

  useEffect(() => {
    if (!show) return;
    if (threadId) {
      loadMessagesForThreadId(threadId);
    } else if (property?.id) {
      loadMessagesForListing(property.id);
    }
  }, [show, property?.id, threadId, loadMessagesForListing, loadMessagesForThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  /* When keyboard opens on mobile (viewport shrinks), scroll messages to bottom so latest stay in view */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  };
  useEffect(() => {
    if (!show || !viewportSize) return;
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToBottom);
    });
    return () => cancelAnimationFrame(t);
  }, [show, viewportSize]);

  /* On mobile, prevent background scroll when chat is open */
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [show]);

  /* On mobile, resize chat panel to visual viewport so the message bar moves up with the keyboard and the header stays put */
  useEffect(() => {
    if (!show || typeof window === 'undefined' || !window.visualViewport) return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    let raf = 0;
    const update = () => {
      raf = requestAnimationFrame(() => {
        setViewportSize({
          height: window.visualViewport.height,
          top: window.visualViewport.offsetTop,
        });
      });
    };
    update();
    window.visualViewport.addEventListener('resize', update);
    window.visualViewport.addEventListener('scroll', update);
    return () => {
      cancelAnimationFrame(raf);
      window.visualViewport.removeEventListener('resize', update);
      window.visualViewport.removeEventListener('scroll', update);
      setViewportSize(null);
    };
  }, [show]);

  if (!show || !property || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage(property.id, text, user);
    setInput('');
  };

  const formatTime = (ts) => {
    if (ts == null) return '';
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-panel-wrap instagram-style" style={{ display: 'block' }} tabIndex="-1">
      <div className="chat-panel-backdrop" onClick={onClose} aria-hidden />
      <div
        className="chat-panel"
        style={
          viewportSize
            ? {
                height: viewportSize.height,
                maxHeight: viewportSize.height,
                top: viewportSize.top,
                bottom: 'auto',
              }
            : undefined
        }
      >
        <div className="chat-panel-header">
          <div className="chat-panel-header-left">
            {onBack && (
              <button type="button" className="chat-panel-back" onClick={onBack} aria-label="Back to messages">
                <i className="fas fa-chevron-left" aria-hidden></i>
              </button>
            )}
            <div className="chat-panel-header-avatar">
              <img src={property.images?.[0]} alt="" />
            </div>
            <span className="chat-panel-header-title">{property.title}</span>
          </div>
          <div className="chat-panel-header-actions">
            <button type="button" className="chat-panel-icon-btn" aria-label="Full screen">
              <i className="fas fa-expand" aria-hidden></i>
            </button>
            <button type="button" className="chat-panel-icon-btn" onClick={onClose} aria-label="Close">
              <i className="fas fa-times" aria-hidden></i>
            </button>
          </div>
        </div>
        <div className="chat-panel-body">
          <div className="chat-panel-messages">
            {messages.length === 0 && (
              <p className="chat-panel-placeholder">
                Start the conversation. Messages are stored in this app.
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-panel-bubble ${msg.isFromUser ? 'chat-panel-bubble-me' : 'chat-panel-bubble-them'}`}
              >
                {!msg.isFromUser && <span className="chat-panel-sender">{msg.senderName}</span>}
                <p className="chat-panel-text">{msg.text}</p>
                <div className="chat-panel-bubble-footer">
                  <span className="chat-panel-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-panel-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="chat-panel-input"
              placeholder="Message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={scrollToBottom}
              aria-label="Message"
            />
            <button type="submit" className="chat-panel-send" aria-label="Send">
              <i className="fas fa-paper-plane" aria-hidden></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
