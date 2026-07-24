import type { LayoutProps } from '../../types/chat';
import styles from './Layout.module.css';

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>AZD Support</h1>
          <p className={styles.subtitle}>Azure Developer CLI Assistant</p>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
