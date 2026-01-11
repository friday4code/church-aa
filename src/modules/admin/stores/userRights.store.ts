import { create } from 'zustand';
import type { UserRight } from '@/types/userRights.type';

interface UserRightsStore {
    userRights: UserRight[];
    setUserRights: (rights: UserRight[]) => void;
}

export const useUserRightsStore = create<UserRightsStore>((set) => ({
    userRights: [],
    setUserRights: (rights) => set({ userRights: rights }),
}));
