
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch all chats for the user
  const fetchChats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setChats(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching chats',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new chat
  const createChat = async (title: string) => {
    if (!user) return null;
    
    try {
      const newChat = {
        title: title || 'New Chat',
        uid: user.id,
      };
      
      const { data, error } = await supabase
        .from('chats')
        .insert(newChat)
        .select()
        .single();

      if (error) throw error;
      
      setChats(prev => [data, ...prev]);
      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating chat',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
    } catch (error: any) {
      toast({
        title: 'Error deleting chat',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Update a chat's title
  const updateChatTitle = async (chatId: string, title: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId);

      if (error) throw error;
      
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ));
    } catch (error: any) {
      toast({
        title: 'Error updating chat',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Load chats when user changes
  useEffect(() => {
    if (user) {
      fetchChats();
    } else {
      setChats([]);
      setLoading(false);
    }
  }, [user]);

  return {
    chats,
    loading,
    createChat,
    deleteChat,
    updateChatTitle,
    refreshChats: fetchChats,
  };
};
