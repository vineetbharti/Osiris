import React from 'react';
import TopNav from './TopNav';

/**
 * PageShell — the chrome around every authenticated page.
 * Renders TopNav and a max-width content area.
 */
export default function PageShell({ children, maxWidth = 1100 }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-secondary)' }}>
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          background: 'var(--color-background-primary)',
          minHeight: '100vh',
          borderLeft: '0.5px solid var(--color-border-tertiary)',
          borderRight: '0.5px solid var(--color-border-tertiary)',
        }}
      >
        <TopNav />
        <main>{children}</main>
      </div>
    </div>
  );
}
