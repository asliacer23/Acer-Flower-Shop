import { useState, useEffect } from 'react';
import { Send, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { chatService } from '@/services/chat';
import { ConversationWithMessages } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function AdminChatDashboard() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'open' | 'unread' | 'resolved'>('open');

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [filter]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = chatService.subscribeToMessages(
      selectedConversation.id,
      (newMessage) => {
        setSelectedConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
          };
        });
      }
    );

    return () => unsubscribe();
  }, [selectedConversation?.id]);

  const loadConversations = async () => {
    setLoading(true);
    const convs = await chatService.getAllConversations(filter);
    setConversations(convs);

    // Update selected conversation if it's in the list
    if (selectedConversation) {
      const updated = convs.find((c) => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }
    }

    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user?.id) return;

    setSending(true);
    const result = await chatService.sendMessage(
      selectedConversation.id,
      user.id,
      'admin',
      messageInput.trim()
    );

    if (result) {
      setSelectedConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, result],
        };
      });
      setMessageInput('');
    }

    setSending(false);
  };

  const handleStatusChange = async (status: 'open' | 'unread' | 'resolved') => {
    if (!selectedConversation) return;

    const updated = await chatService.updateConversationStatus(
      selectedConversation.id,
      status
    );

    if (updated) {
      setSelectedConversation((prev) =>
        prev ? { ...prev, status } : null
      );
      await loadConversations();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'unread':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-screen">
      {/* Conversations List */}
      <div className="md:col-span-1 border-r border-border">
        <Card className="h-full">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="w-full grid grid-cols-3 mt-2">
                <TabsTrigger value="open" className="text-xs">Open</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <ScrollArea className="h-[calc(100%-140px)]">
            <div className="space-y-2 p-4">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No conversations
                </p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedConversation?.id === conv.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          User {conv.user_id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.messages[conv.messages.length - 1]?.text || 'No messages'}
                        </p>
                      </div>
                      {getStatusIcon(conv.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="md:col-span-2">
        {selectedConversation ? (
          <Card className="h-full flex flex-col">
            {/* Header */}
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Conversation {selectedConversation.id.slice(0, 8)}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedConversation.status === 'open' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('open')}
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedConversation.status === 'unread' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('unread')}
                  >
                    Unread
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedConversation.status === 'resolved' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange('resolved')}
                  >
                    Resolved
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === 'admin'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {msg.sender === 'admin' ? 'Admin' : 'User'}
                      </p>
                      {msg.text && <p className="text-sm">{msg.text}</p>}
                      {msg.image_url && (
                        <img
                          src={msg.image_url}
                          alt="Uploaded"
                          className="max-w-full h-auto rounded mt-2"
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
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-4 space-y-2">
              <Textarea
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !messageInput.trim()}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
