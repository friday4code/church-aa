import { create } from "zustand";
import { useScrollArea } from "@chakra-ui/react";
import { persist } from "zustand/middleware";

/**
 * Zustand store for managing ScrollArea reference.
 */
interface ScrollStore {
    scrollArea: ReturnType<typeof useScrollArea> | null;
    setScrollArea: (scrollArea: ReturnType<typeof useScrollArea>) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
    scrollArea: null,
    setScrollArea: (scrollArea) => set({ scrollArea }),
}));


// sidebar store
interface SidebarStore {
    isCollapsed: boolean;
    collapse: () => void;
    expand: () => void;
    toggle: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
    persist(
        (set) => ({
            isCollapsed: false,
            collapse() {
                set({ isCollapsed: true });
            },
            expand() {
                set({ isCollapsed: false });
            },
            toggle() {
                set((state) => ({ isCollapsed: !state.isCollapsed }));
            }
        }),
        {
            name: "sidebar-store",
            partialize: (state) => ({
                isCollapsed: state.isCollapsed
            }),
        }
    )
);