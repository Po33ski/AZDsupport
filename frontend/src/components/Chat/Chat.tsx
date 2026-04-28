import { useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import Message from '../Message/Message';
import MessageInput from '../MessageInput/MessageInput';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import styles from './Chat.module.css';

export default function Chat() {
  const { messages, isLoading, error, sendMessage, clearError } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className={styles.container}>
      <div
        className={styles.messages}
        role="log"
        aria-live="polite"
        aria-label="Historia rozmowy"
      >
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p>
              Witaj! Zapytaj mnie o cokolwiek związanego z{' '}
              <strong>Azure Developer CLI</strong>.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        {error !== null && (
          <div className={styles.error} role="alert">
            <span>{error}</span>
            <button
              className={styles.errorDismiss}
              onClick={clearError}
              aria-label="Zamknij powiadomienie o błędzie"
              type="button"
            >
              ×
            </button>
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      <MessageInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
