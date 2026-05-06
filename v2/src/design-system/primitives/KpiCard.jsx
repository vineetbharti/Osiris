import React from 'react';
import Card from './Card';

/**
 * KpiCard — labeled stat block with optional sub-line.
 * Used heavily on Dashboard and Historical Analytics.
 *
 * Variants:
 *   - default: standard card
 *   - hero: tinted info background, slightly larger value
 */
export default function KpiCard({
  label,
  value,
  subValue,
  subTone = 'success',
  hero = false,
  children,
}) {
  const subToneColors = {
    success: 'var(--color-text-success)',
    secondary: 'var(--color-text-secondary)',
    danger: 'var(--color-text-danger)',
    info: 'var(--color-text-info)',
  };

  return (
    <Card variant={hero ? 'hero' : 'default'} padding={hero ? 18 : 16}>
      <p
        style={{
          fontSize: 11,
          color: hero ? 'var(--color-text-info)' : 'var(--color-text-tertiary)',
          margin: '0 0 8px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      <p
        className="tabular"
        style={{
          fontSize: hero ? 32 : 28,
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          margin: '0 0 6px',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </p>
      {subValue && (
        <p
          className="tabular"
          style={{
            fontSize: 12,
            color: subToneColors[subTone] || subToneColors.success,
            margin: 0,
            fontWeight: subTone === 'secondary' ? 400 : 500,
          }}
        >
          {subValue}
        </p>
      )}
      {children}
    </Card>
  );
}
