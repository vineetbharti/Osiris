import React from 'react';

/**
 * Card — bordered container, used as the base for most content blocks.
 * Variants:
 *   - default: white background, hairline border
 *   - tinted: secondary background (used for active/baseline rows)
 *   - hero: info-tinted background (used for hero KPIs, recommended profiles)
 */
export default function Card({
  variant = 'default',
  emphasis = false,
  padding = 16,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const variantStyle = {
    default: {
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
    },
    tinted: {
      background: 'var(--color-background-secondary)',
      border: '0.5px solid var(--color-border-tertiary)',
    },
    hero: {
      background: 'var(--color-background-info)',
      border: '0.5px solid var(--color-border-info)',
    },
  }[variant];

  const emphasisStyle = emphasis
    ? { border: '1.5px solid var(--color-border-info)' }
    : {};

  return (
    <div
      className={className}
      style={{
        ...variantStyle,
        ...emphasisStyle,
        borderRadius: 'var(--border-radius-lg)',
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
