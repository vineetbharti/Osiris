/**
 * IAuthRepository — authentication + user management.
 *
 * Today: in-memory + localStorage persistence.
 * Tomorrow: API-backed with JWT tokens.
 */
export class IAuthRepository {
  /**
   * @param {{ companyName: string, email: string, password: string }} input
   * @returns {Promise<User>}
   * @throws if email already exists
   */
  async register(input) {
    throw new Error('Not implemented');
  }

  /**
   * @param {{ email: string, password: string }} input
   * @returns {Promise<User>}
   * @throws if credentials invalid
   */
  async login(input) {
    throw new Error('Not implemented');
  }

  async logout() {
    throw new Error('Not implemented');
  }

  /**
   * Returns the current user from session storage if logged in.
   * @returns {Promise<User | null>}
   */
  async getCurrentUser() {
    throw new Error('Not implemented');
  }
}
