import { useState, useEffect, useRef } from 'react';
import { Send, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { chatService } from '@/services/chat';
import { ChatMessage } from '@/types';

interface ChatWindowProps {
  conversationId: string;
  userId: string;
  userName: string;
  isMinimized?: boolean;
  onClose: () => void;
  onToggleMinimize?: () => void;
}

export function ChatWindow({
  conversationId,
  userId,
  userName,
  isMinimized = false,
  onClose,
  onToggleMinimize,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();

    // Subscribe to new messages
    const unsubscribe = chatService.subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadMessages = async () => {
    setLoading(false);
    const msgs = await chatService.getConversationMessages(conversationId);
    setMessages(msgs);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setSending(true);
    const result = await chatService.sendMessage(
      conversationId,
      userId,
      'user',
      inputValue.trim()
    );

    if (result) {
      setMessages((prev) => [...prev, result]);
      setInputValue('');
    }

    setSending(false);
  };

  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-64 bg-card border-primary">
        <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-t">
          <span className="font-semibold text-sm">Chat Support</span>
          <div className="flex gap-2">
            <button
              onClick={onToggleMinimize}
              className="hover:opacity-80"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="hover:opacity-80"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] flex flex-col bg-card shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{userName}</p>
            <p className="text-xs opacity-80">Chat Support</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleMinimize}
            className="hover:opacity-80"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="hover:opacity-80"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  }`}
                >
                  {msg.text && <p className="text-sm">{msg.text}</p>}
                  {msg.image_url && (
                    <img
                      src={msg.image_url}
                      alt="Uploaded"
                      className="max-w-full h-auto rounded"
                    />
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={sending}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={sending || !inputValue.trim()}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
