import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useListings } from '../context/ListingsContext';
import PageHeader from '../components/PageHeader';

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

export default function MessagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getThreads, getMessagesByThreadId, unreadChatCount, refreshThreads } = useChat();
  const { listings } = useListings();
  const didOpenInitialRef = useRef(false);

  const allListings = Array.isArray(listings) ? listings : [];
  const rawThreads = getThreads();
  const threadList = Array.isArray(rawThreads) ? rawThreads : [];
  const threadsWithListing = threadList
    .map((thread) => {
      const listing = allListings.find((l) => l.id === thread.listingId) || {
        id: thread.listingId,
        title: thread.listingTitle || 'Listing',
        images: []
      };
      const apiLast = thread.lastMessage;
      const lastFromApi = apiLast
        ? { text: apiLast.text, timestamp: apiLast.createdAt, isFromUser: apiLast.senderId === user?.id }
        : null;
      const messages = getMessagesByThreadId(thread.id);
      const arr = Array.isArray(messages) ? messages : [];
      const lastFromCache = arr[arr.length - 1];
      const lastMessage = lastFromApi || lastFromCache;
      return { thread, listing, lastMessage };
    })
    .sort((a, b) => (b.lastMessage?.timestamp || b.thread.updatedAt || 0) - (a.lastMessage?.timestamp || a.thread.updatedAt || 0));

  const displayableUnreadCount = typeof unreadChatCount === 'number' ? unreadChatCount : 0;

  const initialThreadId = location.state?.threadId;

  /* Refetch threads when opening Messages so new chats appear */
  useEffect(() => {
    if (user) refreshThreads();
  }, [user, refreshThreads]);

  useEffect(() => {
    if (!initialThreadId || didOpenInitialRef.current) return;
    didOpenInitialRef.current = true;
    navigate(`/chat/${initialThreadId}`, { replace: true });
  }, [initialThreadId, navigate]);

  const handleBack = () => navigate(-1);
  const handleOpenThread = (_listing, threadId) => {
    navigate(`/chat/${threadId}`);
  };

  return (
    <div className="messages-page page-with-header">
      <PageHeader
        title={
          <>
            Messages
            {displayableUnreadCount > 0 && (
              <span className="messages-panel-badge messages-page-badge" aria-label={`${displayableUnreadCount} unread`}>
                {displayableUnreadCount}
              </span>
            )}
          </>
        }
        onBack={handleBack}
      />
      <main className="page-content messages-page-content">
        {threadsWithListing.length === 0 ? (
          <p className="messages-panel-empty">
            No messages yet. Open a listing and use &quot;Chat with Owner/Agent&quot; to start a conversation.
          </p>
        ) : (
          <ul className="messages-panel-list messages-page-list">
            {threadsWithListing.map(({ thread, listing, lastMessage }) => {
              const timestamp = lastMessage?.timestamp || thread.updatedAt;
              const timeLabel = timestamp ? (relativeTime(timestamp) === 'now' ? 'now' : `Sent ${relativeTime(timestamp)}`) : null;
              const previewText = lastMessage
                ? (lastMessage.isFromUser ? timeLabel : lastMessage.text)
                : timeLabel;
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    className={`messages-panel-row ${thread.unreadCount > 0 ? 'messages-panel-row-has-unread' : ''}`}
                    onClick={() => handleOpenThread(listing, thread.id)}
                  >
                    <div className="messages-panel-row-avatar">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt="" />
                      ) : (
                        <i className="fas fa-home" aria-hidden style={{ fontSize: '1rem', color: 'var(--bb-text-muted)' }} />
                      )}
                    </div>
                    <div className="messages-panel-row-main">
                      <span className="messages-panel-row-name">
                        {listing.title}
                        {thread.otherParticipantName && (
                          <span className="text-muted fw-normal"> · {thread.otherParticipantName}</span>
                        )}
                      </span>
                      {previewText && (
                        <span className="messages-panel-row-preview">
                          {previewText}
                        </span>
                      )}
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="messages-panel-row-unread" aria-label="Unread" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
