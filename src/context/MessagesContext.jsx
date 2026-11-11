import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { messagesService, unreadCount, generateDemoReply } from '../services/messagesService';
import { KEYS } from '../services/storage';
import { STORAGE_PREFIX } from '../config/site';
import { useAuth } from './AuthContext';
import { useListings } from './ListingsContext';

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const { user, getUser } = useAuth();
  const { getListing } = useListings();
  const userId = user?.id ?? null;

  const [state, setState] = useState(() => ({
    owner: userId,
    conversations: userId ? messagesService.listForUser(userId) : [],
  }));
  const [typing, setTyping] = useState({});
  const timers = useRef(new Set());

  if (state.owner !== userId) {
    setState({ owner: userId, conversations: userId ? messagesService.listForUser(userId) : [] });
  }

  const refresh = useCallback(() => {
    setState({ owner: userId, conversations: userId ? messagesService.listForUser(userId) : [] });
  }, [userId]);

  // Keep several open tabs in sync (e.g. buyer and seller accounts side by side).
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_PREFIX + KEYS.conversations) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  const startConversation = useCallback(
    async (listing) => {
      if (!userId) throw new Error('Please sign in to message sellers.');
      const conversation = await messagesService.start({
        listingId: listing.id,
        buyerId: userId,
        sellerId: listing.sellerId,
      });
      refresh();
      return conversation;
    },
    [userId, refresh],
  );

  /**
   * Demo sellers cannot sign in, so they answer automatically after a short
   * "typing…" delay. Real accounts receive the message in their inbox.
   */
  const scheduleDemoReply = useCallback(
    (conversation, text) => {
      const otherId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
      const other = getUser(otherId);
      if (!other || other.canSignIn) return;
      const listing = getListing(conversation.listingId);
      later(() => setTyping((t) => ({ ...t, [conversation.id]: true })), 900);
      later(
        () => {
          try {
            messagesService.send(conversation.id, otherId, generateDemoReply(text, listing));
          } finally {
            setTyping((t) => ({ ...t, [conversation.id]: false }));
            refresh();
          }
        },
        2200 + Math.random() * 1600,
      );
    },
    [userId, getUser, getListing, later, refresh],
  );

  const sendMessage = useCallback(
    (conversationId, text) => {
      if (!userId || !text.trim()) return null;
      const conversation = messagesService.send(conversationId, userId, text);
      refresh();
      scheduleDemoReply(conversation, text);
      return conversation;
    },
    [userId, refresh, scheduleDemoReply],
  );

  const markRead = useCallback(
    (conversationId) => {
      if (!userId) return;
      const conversation = state.conversations.find((c) => c.id === conversationId);
      if (conversation && unreadCount(conversation, userId) === 0) return;
      messagesService.markRead(conversationId, userId);
      refresh();
    },
    [userId, state.conversations, refresh],
  );

  const deleteConversation = useCallback(
    (conversationId) => {
      if (!userId) return;
      messagesService.remove(conversationId, userId);
      refresh();
    },
    [userId, refresh],
  );

  const conversations = state.conversations;
  const unreadTotal = useMemo(
    () => (userId ? conversations.reduce((sum, c) => sum + unreadCount(c, userId), 0) : 0),
    [conversations, userId],
  );

  const value = useMemo(
    () => ({
      conversations,
      unreadTotal,
      typing,
      getConversation: (id) => conversations.find((c) => c.id === id) ?? null,
      startConversation,
      sendMessage,
      markRead,
      deleteConversation,
    }),
    [conversations, unreadTotal, typing, startConversation, sendMessage, markRead, deleteConversation],
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) throw new Error('useMessages must be used inside <MessagesProvider>');
  return context;
}
