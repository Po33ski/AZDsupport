import type { ApiChatRequest, ApiChatResponse } from '../types/chat';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function postChat(request: ApiChatRequest): Promise<ApiChatResponse> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Błąd serwera: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<ApiChatResponse>;
}
