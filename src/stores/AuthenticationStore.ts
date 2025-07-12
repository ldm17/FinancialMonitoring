import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
// eslint-disable-next-line import/extensions, import/no-unresolved
import ApiClient from '@/api/ApiClient';

export const useAuthenticationStore = defineStore('authenticationStore', {
  state: () => ({
    isAuthenticated: false,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: null as any,
  }),
  actions: {
    async initializeTokens() {
      this.token = localStorage.getItem('token');
      this.refreshToken = localStorage.getItem('refreshToken');

      const isAccessValid = this.isTokenValid(this.token);
      if (isAccessValid) {
        this.isAuthenticated = true;
        this.user = this.getUserFromToken();
        return;
      }

      const isRefreshValid = this.isTokenValid(this.refreshToken);
      if (isRefreshValid) {
        try {
          await this.refreshTokenUpdate();
          this.isAuthenticated = true;
          this.user = this.getUserFromToken();
        } catch (error) {
          console.error('Ошибка при обновлении токенов:', error);
          this.isAuthenticated = false;
        }
      } else {
        this.isAuthenticated = false;
      }
    },
    login(newToken: any, newRefreshToken: any) {
      this.isAuthenticated = true;
      this.token = newToken;
      this.refreshToken = newRefreshToken.token;
      this.user = this.getUserFromToken();

      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken.token);
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    clearAuth() {
      this.isAuthenticated = false;
      this.token = null;
      this.refreshToken = null;
      this.user = null;

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    async logout() {
      try {
        await ApiClient.post('/auth/logout');
      } catch (error) {
        console.error('Ошибка при выходе на сервере', error);
      } finally {
        this.clearAuth();
      }
    },
    getToken(): string | null {
      return this.token;
    },
    checkAuth() {
      this.isAuthenticated = this.isTokenValid(this.token);
    },
    isTokenValid(token: string | null): boolean {
      if (!token) return false;
      try {
        const decoded = jwtDecode(token) as { exp: number };
        return decoded.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    },
    isAccessTokenValid(): boolean {
      return this.isTokenValid(this.token);
    },
    isRefreshTokenValid(): boolean {
      return this.isTokenValid(this.refreshToken);
    },
    async refreshTokenUpdate() {
      console.log('Попытка обновления токенов...');

      if (!this.isRefreshTokenValid()) {
        console.log('Refresh token недействителен');
        this.clearAuth();
        throw new Error('Refresh token expired');
      }

      try {
        const response = await ApiClient.post('/auth/refresh-token', {
          refreshToken: this.refreshToken,
        });

        console.log('Новые токены получены:', {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        });

        this.$patch({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          isAuthenticated: true,
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        return true;
      } catch (error) {
        console.error('Ошибка обновления токенов:', error);
        this.clearAuth();
        throw error;
      }
    },
    getUserFromToken() {
      if (this.token) {
        try {
          const decoded = jwtDecode(this.token) as Record<string, string>;

          const userName = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
          const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

          return { userName, userId };
        } catch (error) {
          console.error('Не удалось декодировать токен');
          return null;
        }
      }
      return null;
    },
  },
});

export default {};
