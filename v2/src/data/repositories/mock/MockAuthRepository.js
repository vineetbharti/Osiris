import { IAuthRepository } from '../interfaces/IAuthRepository';

const USERS_KEY = 'osiris.users';
const CURRENT_USER_KEY = 'osiris.currentUser';

/**
 * MockAuthRepository — in-memory + localStorage user management.
 * Carries over the auth flow from the existing app, refactored behind
 * the repository contract.
 *
 * Real implementation would talk to an auth service issuing JWT tokens.
 */
export class MockAuthRepository extends IAuthRepository {
  _readUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  _writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  _setCurrentUser(user) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  async register({ companyName, email, password }) {
    if (!companyName || !email || !password) {
      throw new Error('All fields are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    const users = this._readUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error('Email already registered');
    }
    const user = {
      id: `u_${Date.now()}`,
      companyName,
      email,
      // Note: in a real system we'd hash passwords. This is mock-only.
      _password: password,
    };
    this._writeUsers([...users, user]);
    return { id: user.id, companyName, email };
  }

  async login({ email, password }) {
    const users = this._readUsers();
    const user = users.find(
      (u) => u.email === email && u._password === password
    );
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const sanitized = { id: user.id, companyName: user.companyName, email: user.email };
    this._setCurrentUser(sanitized);
    return sanitized;
  }

  async logout() {
    this._setCurrentUser(null);
  }

  async getCurrentUser() {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
}
