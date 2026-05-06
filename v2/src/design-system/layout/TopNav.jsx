import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * TopNav — horizontal navigation, identical across all authenticated pages.
 * Five tabs in this order: Dashboard, Fleet, Vessel Intelligence,
 * Port Intelligence, Historical Analytics.
 *
 * The right side shows the current user's avatar (initials) and a logout menu.
 */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/fleet', label: 'Fleet' },
  { to: '/fleet', label: 'Vessel Intelligence', matchExact: false, hint: 'select-vessel' },
  { to: '/ports', label: 'Port Intelligence' },
  { to: '/history', label: 'Historical Analytics' },
];

export default function TopNav() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const initials = currentUser?.companyName
    ? currentUser.companyName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OS';

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        gap: 28,
        background: 'var(--color-background-primary)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        Osiris
      </span>

      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.matchExact !== false}
            style={({ isActive }) => ({
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              color: isActive
                ? 'var(--color-text-primary)'
                : 'var(--color-text-secondary)',
              background: isActive
                ? 'var(--color-background-secondary)'
                : 'transparent',
              borderRadius: 'var(--border-radius-md)',
              textDecoration: 'none',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <button
        onClick={onLogout}
        title="Sign out"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--color-background-secondary)',
          color: 'var(--color-text-secondary)',
          fontSize: 11,
          fontWeight: 500,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {initials}
      </button>
    </nav>
  );
}
