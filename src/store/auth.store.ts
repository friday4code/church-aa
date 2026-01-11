// store/auth.store.ts
import type { Tokens } from "@/types/auth.type";
import type { User } from "@/types/users.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  tokens: Tokens | null;
  user: User | null;

  setAuth: (data: { tokens: Tokens; user: User }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      user: null,

      setAuth: (data) => {
        set({ tokens: data.tokens, user: data.user || null });
      },

      logout: () => {
        set({ tokens: null, user: null });
        // Clear any persisted data
        localStorage.removeItem('auth-storage');
      },

      isAuthenticated: () => !!get().tokens?.access_token,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        tokens: state.tokens,
        user:state.user
      }),
    }
  )
);
