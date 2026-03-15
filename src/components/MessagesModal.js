import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';

function relativeTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 1) return 'now';
  if (diffM < 60) return `${diffM}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const MessagesModal = ({ show, onClose, allListings, onOpenThread, initialThreadId, onClearInitialThreadId }) => {
  const { getThreads, getMessagesByThreadId, unreadChatCount, refreshThreads } = useChat();
  const [viewportSize, setViewportSize] = useState(null);
  const didOpenInitialRef = useRef(false);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [show]);

  /* Refetch threads when modal opens so new chats appear */
  useEffect(() => {
    if (show) refreshThreads();
  }, [show, refreshThreads]);

  // When opened from push notification with threadId, auto-open that thread once it's in the list
  useEffect(() => {
    if (!show) {
      didOpenInitialRef.current = false;
      return;
    }
    if (!initialThreadId || didOpenInitialRef.current) return;
    const rawThreads = getThreads();
    const threadList = Array.isArray(rawThreads) ? rawThreads : [];
    const list = Array.isArray(allListings) ? allListings : [];
    if (!threadList.length) return;
    const thread = threadList.find((t) => String(t.id) === String(initialThreadId));
    if (!thread) return;
    const listing = list.find((l) => l.id === thread.listingId);
    if (!listing) return;
    didOpenInitialRef.current = true;
    onOpenThread(listing, thread.id);
    onClearInitialThreadId?.();
  }, [show, initialThreadId, getThreads, allListings, onOpenThread, onClearInitialThreadId]);

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

  const rawThreads = getThreads();
  const threadList = Array.isArray(rawThreads) ? rawThreads : [];
  const list = Array.isArray(allListings) ? allListings : [];
  const threadsWithListing = threadList
    .map((thread) => {
      const listing = list.find((l) => l.id === thread.listingId);
      const messages = getMessagesByThreadId(thread.id);
      const arr = Array.isArray(messages) ? messages : [];
      const last = arr[arr.length - 1];
      return listing ? { thread, listing, lastMessage: last } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));

  const displayableUnreadCount = typeof unreadChatCount === 'number' ? unreadChatCount : 0;

  if (!show) return null;

  const handleOpen = (listing, threadId) => {
    onOpenThread(listing, threadId);
    onClose();
  };

  return (
    <div className="messages-panel-wrap instagram-style" style={{ display: 'block' }} tabIndex="-1">
      <div className="messages-panel-backdrop" onClick={onClose} aria-hidden />
      <div
        className="messages-panel"
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
        <div className="messages-panel-header">
          <h2 className="messages-panel-title">
            Messages
            {displayableUnreadCount > 0 && (
              <span className="messages-panel-badge" aria-label={`${displayableUnreadCount} unread`}>
                {displayableUnreadCount}
              </span>
            )}
          </h2>
          <div className="messages-panel-header-actions">
            <button type="button" className="messages-panel-icon-btn" aria-label="Minimize">
              <i className="fas fa-minus" aria-hidden></i>
            </button>
            <button type="button" className="messages-panel-icon-btn" onClick={onClose} aria-label="Close">
              <i className="fas fa-times" aria-hidden></i>
            </button>
          </div>
        </div>
        <div className="messages-panel-body">
          {threadsWithListing.length === 0 ? (
            <p className="messages-panel-empty">
                No messages yet. Open a listing and use "Chat with Owner/Agent" to start a conversation.
            </p>
          ) : (
            <ul className="messages-panel-list">
              {threadsWithListing.map(({ thread, listing, lastMessage }) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    className="messages-panel-row"
                    onClick={() => handleOpen(listing, thread.id)}
                  >
                    {thread.unreadCount > 0 && (
                      <span className="messages-panel-row-unread" aria-label="Unread" />
                    )}
                    <div className="messages-panel-row-avatar">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt="" />
                      ) : (
                        <i className="fas fa-home" aria-hidden style={{ fontSize: '1.25rem', color: 'var(--bb-text-muted)' }} />
                      )}
                    </div>
                    <div className="messages-panel-row-main">
                      <div className="messages-panel-row-top">
                        <span className="messages-panel-row-name">
                          {listing.title}
                          {thread.otherParticipantName && (
                            <span className="text-muted fw-normal"> · {thread.otherParticipantName}</span>
                          )}
                        </span>
                        <span className="messages-panel-row-time">{relativeTime(lastMessage?.timestamp)}</span>
                      </div>
                      {lastMessage && (
                        <div className="messages-panel-row-preview">
                          {lastMessage.isFromUser ? 'You: ' : ''}{lastMessage.text}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesModal;
