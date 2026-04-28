import type { Message as MessageType } from '../../types/chat';
import styles from './Message.module.css';

interface MessageProps {
  message: MessageType;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <article
      className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}
      aria-label={isUser ? 'Twoja wiadomość' : 'Odpowiedź asystenta'}
    >
      <div
        className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAssistant}`}
        aria-hidden="true"
      >
        {isUser ? 'Ty' : 'AI'}
      </div>
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
        <p className={styles.content}>{message.content}</p>
        <time className={styles.timestamp} dateTime={message.timestamp.toISOString()}>
          {formatTime(message.timestamp)}
        </time>
      </div>
    </article>
  );
}
