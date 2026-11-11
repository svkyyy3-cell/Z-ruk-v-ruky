import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useListings } from '../../context/ListingsContext';
import { useMessages } from '../../context/MessagesContext';
import { unreadCount } from '../../services/messagesService';
import { formatChatTime } from '../../utils/format';
import { resolveImage } from '../../utils/images';
import { Avatar } from '../ui/Display';
import { Input, Segmented } from '../ui/Field';

export function ConversationList({ className = '' }) {
  const { user, getUser } = useAuth();
  const { getListing } = useListings();
  const { conversations, typing } = useMessages();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  const rows = conversations
    .map((conversation) => {
      const otherId = conversation.buyerId === user.id ? conversation.sellerId : conversation.buyerId;
      return {
        conversation,
        other: getUser(otherId),
        listing: getListing(conversation.listingId),
        role: conversation.buyerId === user.id ? 'buying' : 'selling',
        last: conversation.messages[conversation.messages.length - 1],
        unread: unreadCount(conversation, user.id),
      };
    })
    .filter((row) => tab === 'all' || row.role === tab)
    .filter((row) => {
      const term = query.trim().toLowerCase();
      if (!term) return true;
      return [row.other?.name, row.listing?.title].some((text) => text?.toLowerCase().includes(term));
    });

  return (
    <aside className={`convs ${className}`} aria-label="Conversations">
      <div className="convs__head">
        <h1 className="convs__title">Messages</h1>
        <Input icon={Search} placeholder="Search chats" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search chats" />
        <Segmented
          name="chat-tab"
          size="sm"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'all', label: 'All' },
            { value: 'buying', label: 'Buying' },
            { value: 'selling', label: 'Selling' },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <p className="convs__empty">
          {conversations.length === 0
            ? 'No conversations yet. Message a seller from any listing to start chatting.'
            : 'No chats match your filters.'}
        </p>
      ) : (
        <ul className="convs__list">
          {rows.map(({ conversation, other, listing, last, unread, role }) => (
            <li key={conversation.id}>
              <NavLink to={`/messages/${conversation.id}`} className={`conv ${unread ? 'is-unread' : ''}`}>
                <span className="conv__avatar">
                  <Avatar user={other} size={46} />
                  {listing && <img src={resolveImage(listing.images[0], { w: 64, h: 64 })} alt="" className="conv__thumb" loading="lazy" />}
                </span>
                <span className="conv__body">
                  <span className="conv__top">
                    <span className="conv__name">{other?.name ?? 'Deleted user'}</span>
                    {last && <time className="conv__time">{formatChatTime(last.createdAt)}</time>}
                  </span>
                  <span className="conv__listing">
                    <span className={`conv__role conv__role--${role}`}>{role === 'buying' ? 'Buying' : 'Selling'}</span>
                    {listing?.title ?? 'Listing removed'}
                  </span>
                  <span className="conv__preview">
                    {typing[conversation.id] ? (
                      <em className="conv__typing">typing…</em>
                    ) : last ? (
                      <>
                        {last.senderId === user.id && 'You: '}
                        {last.text}
                      </>
                    ) : (
                      'Say hello 👋'
                    )}
                  </span>
                </span>
                {unread > 0 && (
                  <span className="conv__unread" aria-label={`${unread} unread`}>
                    {unread}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
