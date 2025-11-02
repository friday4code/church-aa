// stores/oldGroups.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OldGroupFormData } from '../schemas/oldgroups.schema';

export interface OldGroup {
    id: number;
    stateName: string;
    regionName: string;
    groupName: string;
    leader?: string;
}

interface OldGroupsStore {
    oldGroups: OldGroup[];
    addOldGroup: (group: OldGroupFormData) => void;
    updateOldGroup: (id: number, group: Partial<OldGroupFormData>) => void;
    deleteOldGroup: (id: number) => void;
    setOldGroups: (groups: OldGroup[]) => void;
}

export const useOldGroupsStore = create<OldGroupsStore>()(
    persist(
        (set) => ({
            oldGroups: [],

            addOldGroup: (groupData) => {
                const newGroup: OldGroup = {
                    id: Date.now(),
                    ...groupData,
                };
                set((state) => ({
                    oldGroups: [...state.oldGroups, newGroup],
                }));
            },

            updateOldGroup: (id, groupData) => {
                set((state) => ({
                    oldGroups: state.oldGroups.map((group) =>
                        group.id === id ? { ...group, ...groupData } : group
                    ),
                }));
            },

            deleteOldGroup: (id) => {
                set((state) => ({
                    oldGroups: state.oldGroups.filter((group) => group.id !== id),
                }));
            },

            setOldGroups: (groups) => {
                set({ oldGroups: groups });
            },
        }),
        {
            name: 'old-groups-storage',
        }
    )
);