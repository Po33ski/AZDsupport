import type { MessageProps } from '../../types/chat';
import styles from './Message.module.css';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <article
      className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAssistant}`}
      aria-label={isUser ? 'Your message' : "Assistant's response"}
    >
      <div
        className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAssistant}`}
        aria-hidden="true"
      >
        {isUser ? 'Me' : 'AI'}
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
