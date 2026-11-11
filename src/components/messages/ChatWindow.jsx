import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CheckCheck, SendHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useListings } from '../../context/ListingsContext';
import { useMessages } from '../../context/MessagesContext';
import { formatDate, formatPrice, formatTime } from '../../utils/format';
import { resolveImage } from '../../utils/images';
import { Avatar, Badge, Rating, VerifiedMark } from '../ui/Display';
import { ConfirmDialog } from '../ui/Modal';

const BUYER_PROMPTS = ['Hi! Is it still available?', 'What’s your best price?', 'Can I see it today?', 'Can you deliver it?'];
const SELLER_PROMPTS = ['Yes, it’s still available.', 'When would you like to come?', 'I can send more photos.'];

const dayKey = (ts) => new Date(ts).toDateString();

function dayLabel(ts) {
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (dayKey(ts) === today.toDateString()) return 'Today';
  if (dayKey(ts) === yesterday.toDateString()) return 'Yesterday';
  return formatDate(ts);
}

export function ChatWindow({ conversation }) {
  const navigate = useNavigate();
  const { user, getUser } = useAuth();
  const { getListing } = useListings();
  const { sendMessage, markRead, typing, deleteConversation } = useMessages();
  const [text, setText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const otherId = conversation.buyerId === user.id ? conversation.sellerId : conversation.buyerId;
  const other = getUser(otherId);
  const listing = getListing(conversation.listingId);
  const isBuyer = conversation.buyerId === user.id;
  const isTyping = Boolean(typing[conversation.id]);
  const otherReadAt = conversation.lastReadAt?.[otherId] ?? 0;
  const { messages } = conversation;

  // Mark messages as read whenever new ones arrive while the chat is open.
  useEffect(() => {
    markRead(conversation.id);
  }, [conversation.id, messages.length, markRead]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, isTyping, conversation.id]);

  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) inputRef.current?.focus();
  }, [conversation.id]);

  const send = (value = text) => {
    if (!value.trim()) return;
    sendMessage(conversation.id, value);
    setText('');
    inputRef.current?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const myMessages = messages.filter((m) => m.senderId === user.id).length;
  const prompts = isBuyer ? BUYER_PROMPTS : SELLER_PROMPTS;

  return (
    <section className="chat" aria-label={`Conversation with ${other?.name ?? 'user'}`}>
      <header className="chat__head">
        <Link to="/messages" className="chat__back" aria-label="Back to conversations">
          <ArrowLeft size={20} />
        </Link>
        <Link to={`/user/${otherId}`} className="chat__who">
          <Avatar user={other} size={42} />
          <span>
            <span className="chat__name">
              {other?.name ?? 'Deleted user'} {other?.verified && <VerifiedMark size={14} />}
            </span>
            <span className="chat__status">
              {isTyping ? <em>typing…</em> : other ? <Rating value={other.rating} count={other.reviewsCount} size={12} /> : null}
            </span>
          </span>
        </Link>
        <button type="button" className="icon-btn" onClick={() => setConfirmDelete(true)} aria-label="Delete conversation" title="Delete conversation">
          <Trash2 size={18} />
        </button>
      </header>

      {listing ? (
        <Link to={`/listing/${listing.id}`} className="chat__listing">
          <img src={resolveImage(listing.images[0], { w: 112, h: 112 })} alt="" />
          <span className="chat__listing-info">
            <span className="chat__listing-title">{listing.title}</span>
            <span className="chat__listing-price">{formatPrice(listing)}</span>
          </span>
          {listing.status === 'sold' && <Badge tone="neutral">Sold</Badge>}
        </Link>
      ) : (
        <p className="chat__listing chat__listing--gone">This listing has been removed by the seller.</p>
      )}

      <div className="chat__scroll" ref={scrollRef} aria-live="polite">
        {messages.length === 0 && (
          <div className="chat__intro">
            <p>
              Start the conversation with <strong>{other?.name?.split(' ')[0] ?? 'the seller'}</strong>. Keep payments and personal details
              safe — never pay in advance.
            </p>
          </div>
        )}
        {messages.map((message, index) => {
          const mine = message.senderId === user.id;
          const newDay = index === 0 || dayKey(messages[index - 1].createdAt) !== dayKey(message.createdAt);
          const read = mine && otherReadAt >= message.createdAt;
          return (
            <Fragment key={message.id}>
              {newDay && <p className="chat__day">{dayLabel(message.createdAt)}</p>}
              <div className={`bubble ${mine ? 'bubble--mine' : 'bubble--theirs'}`}>
                <p className="bubble__text">{message.text}</p>
                <span className="bubble__meta">
                  {formatTime(message.createdAt)}
                  {mine &&
                    (read ? (
                      <CheckCheck size={14} aria-label="Read" className="bubble__read" />
                    ) : (
                      <Check size={14} aria-label="Sent" />
                    ))}
                </span>
              </div>
            </Fragment>
          );
        })}
        {isTyping && (
          <div className="bubble bubble--theirs bubble--typing" aria-label={`${other?.name} is typing`}>
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      {myMessages === 0 && (
        <div className="chat__prompts" aria-label="Quick replies">
          {prompts.map((prompt) => (
            <button key={prompt} type="button" className="chip" onClick={() => send(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className="visually-hidden" htmlFor="composer-input">
          Message
        </label>
        <textarea
          id="composer-input"
          ref={inputRef}
          rows={1}
          value={text}
          maxLength={2000}
          placeholder="Write a message…"
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
          }}
          onKeyDown={onKeyDown}
        />
        <button type="submit" className="composer__send" disabled={!text.trim()} aria-label="Send message">
          <SendHorizontal size={20} />
        </button>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteConversation(conversation.id);
          navigate('/messages', { replace: true });
        }}
        title="Delete this conversation?"
        description="The chat history will be removed for both participants on this device."
        confirmLabel="Delete chat"
      />
    </section>
  );
}
