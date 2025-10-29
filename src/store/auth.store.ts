// --------------------
// Zustand store type

import type { Tokens, User } from "@/types/auth.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// --------------------
type AuthState = {
  user: User | null;
  tokens: Tokens | null;
  setAuth: (data: { user: User, tokens: Tokens }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getRole: () => User["role"];

  // Role-based getters
  isUser: () => boolean;
  isAdmin: () => boolean;

  // Utility role checkers
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasRoleByCode: (roleCode: string) => boolean;
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

      // ✅ get user role
      getRole: () => {
        return get().user?.role as User["role"];
      },

      // ✅ Logout and clear persisted state
      logout: () => {
        set({ user: null, tokens: null });
      },

      // ✅ Derived state
      isAuthenticated: () => !!get().tokens?.accessToken,

      // ✅ Role-based getters
      isUser: () => {
        const user = get().user;
        const role = user?.role;
        return !!role && role === 'user'
      },

      isAdmin: () => {
        const role = get().user?.role;
        return !!role && role.toLowerCase().includes('admin');
      },
      // ✅ Utility role checkers
      hasRole: (roleName: string) => {
        const role = get().user?.role;
        return !!role && role === roleName;
      },

      hasAnyRole: (roleNames: string[]) => {
        const userRole = get().user?.role;
        return !!userRole && roleNames.some(roleName =>
          userRole === roleName
        );
      },

      hasRoleByCode: (roleCode: string) => {
        const role = get().user?.role;
        return !!role && role === roleCode;
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