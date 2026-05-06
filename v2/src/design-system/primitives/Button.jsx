import React from 'react';

/**
 * Button — minimal styled button. Variants:
 *   - primary: filled blue (used for actions like Add Vessel)
 *   - secondary: bordered (default for less-emphasized actions)
 *   - ghost: text only
 */
export default function Button({
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const sizeStyle =
    size === 'sm'
      ? { height: 30, padding: '0 10px', fontSize: 12 }
      : size === 'lg'
      ? { height: 44, padding: '0 18px', fontSize: 14 }
      : { height: 36, padding: '0 14px', fontSize: 13 };

  const variantStyle = {
    primary: {
      background: 'var(--color-text-info)',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-text-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
      border: 'none',
    },
  }[variant];

  return (
    <button
      className={className}
      disabled={disabled}
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: 'var(--border-radius-md)',
        fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 100ms',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
