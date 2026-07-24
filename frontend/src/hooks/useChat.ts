import { useState, useCallback, useRef } from 'react';
import type { Message } from '../types/chat';
import { postChat, deleteConversation } from '../services/api';

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  startNewConversation: () => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string | undefined>(undefined);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const data = await postChat({ message: trimmed, conversation_id: conversationIdRef.current });
      conversationIdRef.current = data.conversation_id;
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const startNewConversation = useCallback(async (): Promise<void> => {
    const previousConversationId = conversationIdRef.current;
    conversationIdRef.current = undefined;
    setMessages([]);
    setError(null);

    if (previousConversationId) {
      try {
        await deleteConversation(previousConversationId);
      } catch {
        // Best-effort cleanup: the old conversation may linger server-side,
        // but the user's local chat has already moved on.
      }
    }
  }, []);

  return { messages, isLoading, error, sendMessage, clearError, startNewConversation };
}
