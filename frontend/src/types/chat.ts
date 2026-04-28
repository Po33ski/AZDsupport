export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ApiChatRequest {
  message: string;
}

export interface ApiChatResponse {
  conversation_id: string;
  response: string;
}
