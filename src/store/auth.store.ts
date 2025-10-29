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
  getRoles: () => User["roles"];

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

      // ✅ get user roles
      getRoles: () => {
        return get().user?.roles as User["roles"];
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
        const roles = user?.roles;
        // User is applicant if they have Applicant role OR if they have applicant data but no user roles
        return !!roles && roles.some((role) =>
          role?.name === 'User' || role.code === 'user'
        );
      },

      isAdmin: () => {
        const roles = get().user?.roles;
        return !!roles && roles.some((role) =>
          role.name.toLowerCase().includes('admin') ||
          role.code.toLowerCase().includes('admin')
        );
      },
      // ✅ Utility role checkers
      hasRole: (roleName: string) => {
        const roles = get().user?.roles;
        return !!roles && roles.some(role => role.name === roleName);
      },

      hasAnyRole: (roleNames: string[]) => {
        const userRoles = get().user?.roles;
        return !!userRoles && roleNames.some(roleName =>
          userRoles.some(userRole => userRole.name === roleName)
        );
      },

      hasRoleByCode: (roleCode: string) => {
        const roles = get().user?.roles;
        return !!roles && roles.some(role => role.code === roleCode);
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