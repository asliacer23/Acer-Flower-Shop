// Service for real-time customer support chat
import { supabase } from '@/lib/supabase';
import { Conversation, ChatMessage, ConversationWithMessages } from '@/types';

/**
 * Create a new conversation for a user
 */
export async function createConversation(userId: string): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId, status: 'open' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

/**
 * Get or create user's active conversation
 */
export async function getOrCreateConversation(userId: string): Promise<Conversation | null> {
  try {
    // Check for existing open conversation
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (!fetchError && existing) {
      return existing;
    }

    // Create new conversation if none exists
    return await createConversation(userId);
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    return null;
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  sender: 'user' | 'admin',
  text?: string,
  imageUrl?: string
): Promise<ChatMessage | null> {
  try {
    if (!text && !imageUrl) {
      throw new Error('Message must contain text or image');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender,
        text: text || null,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

/**
 * Get all messages in a conversation
 */
export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

/**
 * Get user's conversation with all messages
 */
export async function getUserConversationWithMessages(userId: string): Promise<ConversationWithMessages | null> {
  try {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (convError && convError.code !== 'PGRST116') throw convError;
    if (!conversation) return null;

    const messages = await getConversationMessages(conversation.id);

    return {
      ...conversation,
      messages,
    };
  } catch (error) {
    console.error('Error fetching conversation with messages:', error);
    return null;
  }
}

/**
 * Get all conversations (admin view)
 * Can filter by status: 'open', 'unread', 'resolved'
 */
export async function getAllConversations(
  status?: 'open' | 'unread' | 'resolved'
): Promise<ConversationWithMessages[]> {
  try {
    let query = supabase.from('conversations').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data: conversations, error } = await query.order('updated_at', {
      ascending: false,
    });

    if (error) throw error;

    // Fetch messages for each conversation
    const withMessages = await Promise.all(
      (conversations || []).map(async (conv) => ({
        ...conv,
        messages: await getConversationMessages(conv.id),
      }))
    );

    return withMessages;
  } catch (error) {
    console.error('Error fetching all conversations:', error);
    return [];
  }
}

/**
 * Update conversation status
 */
export async function updateConversationStatus(
  conversationId: string,
  status: 'open' | 'unread' | 'resolved'
): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating conversation status:', error);
    return null;
  }
}

/**
 * Close conversation
 */
export async function closeConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({
        status: 'resolved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error closing conversation:', error);
    return false;
  }
}

/**
 * Subscribe to new messages in a conversation (Realtime)
 * Usage:
 * const unsubscribe = subscribeToMessages(conversationId, (message) => {
 *   console.log('New message:', message);
 * });
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: ChatMessage) => void
) {
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as ChatMessage);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

/**
 * Subscribe to conversation status changes (Realtime)
 */
export function subscribeToConversationStatus(
  conversationId: string,
  onStatusChange: (conversation: Conversation) => void
) {
  const subscription = supabase
    .channel(`conversations:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `id=eq.${conversationId}`,
      },
      (payload) => {
        onStatusChange(payload.new as Conversation);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

export const chatService = {
  createConversation,
  getOrCreateConversation,
  sendMessage,
  getConversationMessages,
  getUserConversationWithMessages,
  getAllConversations,
  updateConversationStatus,
  closeConversation,
  subscribeToMessages,
  subscribeToConversationStatus,
};
