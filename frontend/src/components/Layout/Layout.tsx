import type { ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>AZD Support</h1>
          <p className={styles.subtitle}>Asystent Azure Developer CLI</p>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
