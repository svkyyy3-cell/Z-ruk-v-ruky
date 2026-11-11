import { useParams } from 'react-router-dom';
import { MessageCircleOff, MessagesSquare } from 'lucide-react';
import { useMessages } from '../context/MessagesContext';
import { useDocumentTitle } from '../hooks';
import { ConversationList } from '../components/messages/ConversationList';
import { ChatWindow } from '../components/messages/ChatWindow';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Display';

export default function MessagesPage() {
  const { conversationId } = useParams();
  const { getConversation, unreadTotal } = useMessages();
  const conversation = conversationId ? getConversation(conversationId) : null;
  useDocumentTitle(unreadTotal ? `(${unreadTotal}) Messages` : 'Messages');

  return (
    <div className={`container messages ${conversationId ? 'messages--open' : ''}`}>
      <ConversationList className="messages__list" />
      <div className="messages__pane">
        {conversation ? (
          <ChatWindow key={conversation.id} conversation={conversation} />
        ) : conversationId ? (
          <EmptyState
            icon={MessageCircleOff}
            title="Conversation not found"
            action={
              <Button variant="dark" to="/messages">
                Back to messages
              </Button>
            }
          >
            It may have been deleted.
          </EmptyState>
        ) : (
          <div className="messages__placeholder">
            <EmptyState
              icon={MessagesSquare}
              title="Select a conversation"
              action={
                <Button variant="secondary" to="/search">
                  Find something to buy
                </Button>
              }
            >
              Your chats with buyers and sellers appear here. Messages are saved on this device.
            </EmptyState>
          </div>
        )}
      </div>
    </div>
  );
}
