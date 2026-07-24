import type { ReactNode } from 'react';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ApiChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ApiChatResponse {
  conversation_id: string;
  response: string;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  startNewConversation: () => Promise<void>;
}

export interface LayoutProps {
  children: ReactNode;
}

export interface MessageProps {
  message: Message;
}

export interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
}
