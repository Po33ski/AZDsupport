import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message } from '../types/chat';
import { postChat, deleteConversation } from '../services/api';

const CONVERSATION_ID_KEY = 'azd-support:conversationId';
const MESSAGES_KEY = 'azd-support:messages';

function loadStoredConversationId(): string | undefined {
  try {
    return sessionStorage.getItem(CONVERSATION_ID_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function saveStoredConversationId(conversationId: string | undefined): void {
  try {
    if (conversationId) {
      sessionStorage.setItem(CONVERSATION_ID_KEY, conversationId);
    } else {
      sessionStorage.removeItem(CONVERSATION_ID_KEY);
    }
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — persistence is best-effort.
  }
}

function loadStoredMessages(): Message[] {
  try {
    const raw = sessionStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Message[];
    return parsed.map((msg) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
  } catch {
    return [];
  }
}

function saveStoredMessages(messages: Message[]): void {
  try {
    sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — persistence is best-effort.
  }
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  startNewConversation: () => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>(loadStoredMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string | undefined>(loadStoredConversationId());

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

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
      saveStoredConversationId(data.conversation_id);
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const startNewConversation = useCallback(async (): Promise<void> => {
    const previousConversationId = conversationIdRef.current;
    conversationIdRef.current = undefined;
    saveStoredConversationId(undefined);
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
