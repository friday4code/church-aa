// --------------------
// Zustand store type

import type { Tokens, User } from "@/types/auth.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// --------------------
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
};

// --------------------
// Zustand store with persistence
// --------------------
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,

      // ✅ Set authentication data
      setAuth: (data) => {
        const { user, tokens } = data;
        set({ user, tokens });
      },

      // ✅ Get user roles array
      getRoles: () => {
        return get().user?.roles || [];
      },

      // ✅ Logout and clear persisted state
      logout: () => {
        set({ user: null, tokens: null });
      },

      // ✅ Derived state - check if user has valid access token
      isAuthenticated: () => !!get().tokens?.access_token,

      // ✅ Role-based getters
      isUser: () => {
        const roles = get().user?.roles || [];
        return roles.includes('user') || (!roles.includes('admin') && roles.length > 0);
      },

      isAdmin: () => {
        const roles = get().user?.roles || [];
        return roles.includes('admin');
      },

      // ✅ Utility role checkers
      hasRole: (roleName: string) => {
        const roles = get().user?.roles || [];
        return roles.includes(roleName);
      },

      hasAnyRole: (roleNames: string[]) => {
        const userRoles = get().user?.roles || [];
        return userRoles.some(role => roleNames.includes(role));
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