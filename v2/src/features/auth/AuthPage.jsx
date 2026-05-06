import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Card, Input, Button } from '../../design-system/primitives';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthPage — login or register depending on `mode` prop.
 *
 * Shared chrome lives here; the two forms differ only in fields.
 * Refactored from the existing app's AuthPage; uses the new design language
 * but preserves the in-memory user storage (now behind MockAuthRepository).
 */
export default function AuthPage({ mode = 'login' }) {
  const { currentUser, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  const isLogin = mode === 'login';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login({ email, password });
        navigate(redirectTo, { replace: true });
      } else {
        await register({ companyName, email, password });
        setSuccess('Registration successful. Please sign in.');
        setTimeout(() => navigate('/login'), 800);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--color-background-secondary)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 500,
              margin: 0,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Osiris
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--color-text-secondary)',
              margin: '4px 0 0',
            }}
          >
            Marine analytics platform
          </p>
        </div>

        <Card padding={24}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 500,
              margin: '0 0 4px',
              color: 'var(--color-text-primary)',
            }}
          >
            {isLogin ? 'Sign in' : 'Create your account'}
          </h2>
          <p
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              margin: '0 0 20px',
            }}
          >
            {isLogin
              ? 'Welcome back. Sign in to manage your fleet.'
              : 'Get started by registering your company.'}
          </p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!isLogin && (
              <Field label="Company name">
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Shipping Co."
                  required
                />
              </Field>
            )}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ops@acme.com"
                required
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </Field>
            {!isLogin && (
              <Field label="Confirm password">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Field>
            )}

            {error && <Notice tone="danger">{error}</Notice>}
            {success && <Notice tone="success">{success}</Notice>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              style={{ marginTop: 4, width: '100%' }}
            >
              {isSubmitting
                ? isLogin
                  ? 'Signing in…'
                  : 'Creating account…'
                : isLogin
                ? 'Sign in'
                : 'Create account'}
            </Button>
          </form>

          <p
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              margin: '20px 0 0',
              textAlign: 'center',
            }}
          >
            {isLogin ? (
              <>
                New to Osiris?{' '}
                <Link to="/register" style={{ color: 'var(--color-text-info)' }}>
                  Register your company
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-text-info)' }}>
                  Sign in
                </Link>
              </>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Notice({ tone, children }) {
  const colors = {
    danger: { bg: 'var(--color-background-danger)', text: 'var(--color-text-danger)' },
    success: { bg: 'var(--color-background-success)', text: 'var(--color-text-success)' },
  }[tone];
  return (
    <div
      style={{
        padding: '8px 10px',
        background: colors.bg,
        color: colors.text,
        borderRadius: 'var(--border-radius-md)',
        fontSize: 12,
      }}
    >
      {children}
    </div>
  );
}
