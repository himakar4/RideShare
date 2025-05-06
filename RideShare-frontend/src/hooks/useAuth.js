import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE_URL } from '../config';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      login: async (email, password) => {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to login');
          }

          const data = await response.json();
          set({ user: data.user, token: data.token });
          localStorage.setItem('token', data.token);
          return data;
        } catch (error) {
          throw error;
        }
      },
      register: async (userData) => {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to register');
          }

          const data = await response.json();
          set({ user: data.user, token: data.token });
          localStorage.setItem('token', data.token);
          return data;
        } catch (error) {
          throw error;
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ user: null, token: null });
            return;
          }

          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Invalid token');
          }

          const data = await response.json();
          set({ user: data, token });
        } catch (error) {
          localStorage.removeItem('token');
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    token: store.token,
    setUser: store.setUser,
    setToken: store.setToken,
    login: store.login,
    register: store.register,
    logout: store.logout,
    checkAuth: store.checkAuth,
    isAuthenticated: !!store.token,
  };
}; 