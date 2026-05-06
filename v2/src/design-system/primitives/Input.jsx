import React from 'react';

/**
 * Input — minimal styled input that matches the rest of the design system.
 */
export default function Input({ style = {}, ...rest }) {
  return (
    <input
      style={{
        height: 36,
        padding: '0 12px',
        borderRadius: 'var(--border-radius-md)',
        border: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-primary)',
        fontSize: 13,
        color: 'var(--color-text-primary)',
        fontFamily: 'inherit',
        outline: 'none',
        width: '100%',
        ...style,
      }}
      {...rest}
    />
  );
}
