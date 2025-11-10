// store/auth.store.ts
import type { Tokens, User } from "@/types/auth.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: User | null;
  tokens: Tokens | null;
  setAuth: (data: { user: User; tokens: Tokens }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getRoles: () => string[];

  // Role-based getters
  isUser: () => boolean;
  isAdmin: () => boolean;

  // Utility role checkers
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;

  // Access level checkers
  hasAccessLevel: (accessLevel: string) => boolean;
  getAccessLevel: () => string;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,

      setAuth: (data) => {
        const { user, tokens } = data;
        set({ user, tokens });
      },

      getRoles: () => {
        return get().user?.roles || [];
      },

      logout: () => {
        set({ user: null, tokens: null });
      },

      isAuthenticated: () => !!get().tokens?.access_token,

      isUser: () => {
        const roles = get().user?.roles || [];
        return roles.includes('user') || (!roles.includes('admin') && roles.length > 0);
      },

      isAdmin: () => {
        const roles = get().user?.roles || [];
        return roles.includes('admin') || roles.includes('regional_admin') ||
          roles.includes('state_admin') || roles.includes('district_admin');
      },

      hasRole: (roleName: string) => {
        const roles = get().user?.roles || [];
        return roles.includes(roleName);
      },

      hasAnyRole: (roleNames: string[]) => {
        const userRoles = get().user?.roles || [];
        return userRoles.some(role => roleNames.includes(role));
      },

      hasAccessLevel: (accessLevel: string) => {
        return get().user?.access_level === accessLevel;
      },

      getAccessLevel: () => {
        return get().user?.access_level || 'user';
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
);