// stores/groups.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GroupFormData } from '../schemas/group.schema';

export interface Group {
    id: number;
    stateName: string;
    regionName: string;
    groupName: string;
    oldGroupName?: string;
    leader: string;
    createdAt: Date;
    updatedAt: Date;
}

interface GroupsStore {
    groups: Group[];
    addGroup: (data: GroupFormData) => void;
    updateGroup: (id: number, data: Partial<GroupFormData>) => void;
    deleteGroup: (id: number) => void;
    setGroups: (groups: Group[]) => void;
}

export const useGroupsStore = create<GroupsStore>()(
    persist(
        (set) => ({
            groups: [],
            addGroup: (data) => {
                const newGroup: Group = {
                    id: Date.now(),
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ groups: [...state.groups, newGroup] }));
            },
            updateGroup: (id, data) => {
                set((state) => ({
                    groups: state.groups.map((group) =>
                        group.id === id
                            ? { ...group, ...data, updatedAt: new Date() }
                            : group
                    ),
                }));
            },
            deleteGroup: (id) => {
                set((state) => ({
                    groups: state.groups.filter((group) => group.id !== id),
                }));
            },
            setGroups: (groups) => {
                set({ groups });
            },
        }),
        {
            name: 'groups-storage',
        }
    )
);