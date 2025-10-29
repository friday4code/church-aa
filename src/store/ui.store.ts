import { create } from "zustand";
import { useScrollArea } from "@chakra-ui/react";

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
