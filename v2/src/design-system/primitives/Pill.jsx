import React from 'react';

/**
 * Pill — small rounded chip. Used for filters, status tags.
 *
 * Tone variants control color:
 *   - neutral: default gray
 *   - info: blue accent (recommended profiles, current selection)
 *   - success / warning / danger: semantic colors
 *
 * Selected state uses tinted background.
 */
export default function Pill({
  tone = 'neutral',
  selected = false,
  bordered = true,
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const sizeStyle =
    size === 'sm'
      ? { fontSize: 11, padding: '2px 8px' }
      : { fontSize: 12, padding: '5px 12px' };

  const toneColors = {
    neutral: {
      color: 'var(--color-text-secondary)',
      borderColor: 'var(--color-border-tertiary)',
      selectedBg: 'var(--color-background-secondary)',
      selectedColor: 'var(--color-text-primary)',
    },
    info: {
      color: 'var(--color-text-info)',
      borderColor: 'var(--color-border-info)',
      selectedBg: 'var(--color-background-info)',
      selectedColor: 'var(--color-text-info)',
    },
    success: {
      color: 'var(--color-text-success)',
      borderColor: 'var(--color-text-success)',
      selectedBg: 'var(--color-background-success)',
      selectedColor: 'var(--color-text-success)',
    },
    warning: {
      color: 'var(--color-text-warning)',
      borderColor: 'var(--color-text-warning)',
      selectedBg: 'var(--color-background-warning)',
      selectedColor: 'var(--color-text-warning)',
    },
    danger: {
      color: 'var(--color-text-danger)',
      borderColor: 'var(--color-text-danger)',
      selectedBg: 'var(--color-background-danger)',
      selectedColor: 'var(--color-text-danger)',
    },
  }[tone];

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        borderRadius: 999,
        background: selected ? toneColors.selectedBg : 'transparent',
        color: selected ? toneColors.selectedColor : toneColors.color,
        border: bordered ? `0.5px solid ${selected ? 'transparent' : toneColors.borderColor}` : 'none',
        fontWeight: selected ? 500 : 400,
        whiteSpace: 'nowrap',
        ...sizeStyle,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
