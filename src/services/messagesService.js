import { storage, KEYS } from './storage';
import { ApiError, createId, simulate } from './api';

/**
 * Conversations between a buyer and a seller about one listing.
 *
 * Shape: { id, listingId, buyerId, sellerId, messages[], lastReadAt{userId: ts}, updatedAt }
 *
 * The API mirrors what a real-time backend would expose (list, open, send,
 * mark read), so a WebSocket implementation can replace it later.
 */

const read = () => storage.get(KEYS.conversations, []);
const write = (conversations) => storage.set(KEYS.conversations, conversations);

const isParticipant = (conversation, userId) =>
  conversation.buyerId === userId || conversation.sellerId === userId;

export const messagesService = {
  listForUser(userId) {
    return read()
      .filter((c) => isParticipant(c, userId))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async start({ listingId, buyerId, sellerId }) {
    return simulate(() => {
      if (buyerId === sellerId) throw new ApiError('You cannot message yourself.');
      const conversations = read();
      const existing = conversations.find(
        (c) => c.listingId === listingId && c.buyerId === buyerId && c.sellerId === sellerId,
      );
      if (existing) return existing;
      const now = Date.now();
      const conversation = {
        id: createId('c'),
        listingId,
        buyerId,
        sellerId,
        messages: [],
        lastReadAt: { [buyerId]: now, [sellerId]: now },
        updatedAt: now,
        origin: 'user',
      };
      write([conversation, ...conversations]);
      return conversation;
    }, 200);
  },

  /** Synchronous so chat UI feels instant (optimistic send). */
  send(conversationId, senderId, text) {
    const conversations = read();
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation || !isParticipant(conversation, senderId)) {
      throw new ApiError('Conversation not found.', { status: 404 });
    }
    const message = { id: createId('m'), senderId, text: text.trim(), createdAt: Date.now() };
    conversation.messages.push(message);
    conversation.updatedAt = message.createdAt;
    conversation.lastReadAt = { ...conversation.lastReadAt, [senderId]: message.createdAt };
    write(conversations);
    return conversation;
  },

  markRead(conversationId, userId) {
    const conversations = read();
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return null;
    conversation.lastReadAt = { ...conversation.lastReadAt, [userId]: Date.now() };
    write(conversations);
    return conversation;
  },

  remove(conversationId, userId) {
    const conversations = read();
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation || !isParticipant(conversation, userId)) return false;
    write(conversations.filter((c) => c.id !== conversationId));
    return true;
  },
};

export function unreadCount(conversation, userId) {
  const lastRead = conversation.lastReadAt?.[userId] ?? 0;
  return conversation.messages.filter((m) => m.senderId !== userId && m.createdAt > lastRead).length;
}

/* ───────── Demo auto-replies ───────── */

const RULES = [
  {
    test: /(price|discount|cheaper|lower|last|best|take|offer|₴|\d{3,})/i,
    replies: [
      'I can go a little lower if you can pick it up this week. What would you offer?',
      'The price is already fair, but I’ll take 5% off for a quick deal.',
    ],
  },
  {
    test: /(available|still|sold)/i,
    replies: ['Yes, it’s still available!', 'Hi! Yes, still available — a couple of people asked, but nobody has come yet.'],
  },
  {
    test: /(deliver|shipping|send|post|nova|courier)/i,
    replies: ['Sure, I can send it with Nova Poshta, cash on delivery. Shipping is paid by the buyer.'],
  },
  {
    test: /(where|address|meet|see|look|viewing|visit|come|when)/i,
    replies: ['I’m in {location}. Evenings after 18:00 or any time on weekends work for me.', 'You can come and see it in {location}. When suits you?'],
  },
  {
    test: /(photo|picture|video)/i,
    replies: ['Of course, I’ll take a few more photos in daylight and send them here.'],
  },
  {
    test: /(condition|scratch|damage|work|defect|battery)/i,
    replies: ['Everything works as it should. All details are in the description, and you can check it in person.'],
  },
];

const FALLBACK = [
  'Thanks for your message! Let me check and get back to you shortly.',
  'Hi! Happy to answer any questions — what would you like to know?',
  'Sounds good 👍',
];

/** Picks a believable reply for the demo sellers (who are not real people). */
export function generateDemoReply(text, listing) {
  const rule = RULES.find((r) => r.test.test(text));
  const pool = rule ? rule.replies : FALLBACK;
  const reply = pool[Math.floor(Math.random() * pool.length)];
  return reply.replace('{location}', listing?.location ?? 'the city centre');
}
