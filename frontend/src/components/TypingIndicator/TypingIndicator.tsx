import styles from './TypingIndicator.module.css';

export default function TypingIndicator() {
  return (
    <div className={styles.row} role="status" aria-label="Asystent pisze...">
      <div className={styles.avatar} aria-hidden="true">
        AI
      </div>
      <div className={styles.bubble}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}
