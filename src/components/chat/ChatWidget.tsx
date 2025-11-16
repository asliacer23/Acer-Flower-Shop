import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWindow } from './ChatWindow';
import { chatService } from '@/services/chat';
import { Conversation } from '@/types';

interface ChatWidgetProps {
  userId: string;
  userName: string;
}

export function ChatWidget({ userId, userName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    initializeChat();
  }, [userId]);

  const initializeChat = async () => {
    const conv = await chatService.getOrCreateConversation(userId);
    if (conv) {
      setConversation(conv);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!conversation) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg z-40"
          title="Chat with support"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          conversationId={conversation.id}
          userId={userId}
          userName={userName}
          isMinimized={isMinimized}
          onClose={handleClose}
          onToggleMinimize={handleToggleMinimize}
        />
      )}
    </>
  );
}
