// stores/userRights.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUsersStore } from './users.store';
import type { UserRightFormData } from '../schemas/userRights.scheme';

export interface UserRight {
    id: number;
    userId: number;
    userName: string;
    stateName?: string;
    regionName?: string;
    groupName?: string;
    oldGroupName?: string;
    districtName?: string;
    accessLevel: string;
    accessScope: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UserRightsStore {
    userRights: UserRight[];
    addUserRight: (data: UserRightFormData) => void;
    updateUserRight: (id: number, data: Partial<UserRightFormData>) => void;
    deleteUserRight: (id: number) => void;
    setUserRights: (userRights: UserRight[]) => void;
}

export const useUserRightsStore = create<UserRightsStore>()(
    persist(
        (set) => ({
            userRights: [
                {
                    id: 1,
                    userId: 1,
                    userName: 'Samuel Adiela',
                    accessLevel: 'super_admin',
                    accessScope: 'All States',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    userId: 2,
                    userName: 'ISAAC DEKO',
                    accessLevel: 'super_admin',
                    accessScope: 'All States',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 3,
                    userId: 3,
                    userName: 'Daniel Okon',
                    accessLevel: 'super_admin',
                    accessScope: 'All States',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 4,
                    userId: 4,
                    userName: 'abuloma.grp abuloma.grp',
                    accessLevel: 'group_admin',
                    accessScope: 'Abuloma',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 5,
                    userId: 5,
                    userName: 'efikrainbow.grp efikrainbow.grp',
                    accessLevel: 'group_admin',
                    accessScope: 'Efik-Rainbow',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Add more sample user rights as needed
            ],
            addUserRight: (data) => {
                const { users } = useUsersStore.getState();
                const user = users.find(u => u.id.toString() === data.userId);
                const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';

                // Determine access scope based on the data
                let accessScope = 'All States';
                if (data.districtName) {
                    accessScope = data.districtName;
                } else if (data.groupName) {
                    accessScope = data.groupName;
                } else if (data.regionName) {
                    accessScope = data.regionName;
                } else if (data.stateName) {
                    accessScope = data.stateName;
                }

                const newUserRight: UserRight = {
                    id: Date.now(),
                    userId: parseInt(data.userId),
                    userName,
                    stateName: data.stateName,
                    regionName: data.regionName,
                    groupName: data.groupName,
                    oldGroupName: data.oldGroupName,
                    districtName: data.districtName,
                    accessLevel: data.accessLevel,
                    accessScope,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ userRights: [...state.userRights, newUserRight] }));
            },
            updateUserRight: (id, data) => {
                const { users } = useUsersStore.getState();

                set((state) => ({
                    userRights: state.userRights.map((userRight) => {
                        if (userRight.id === id) {
                            const updatedData = { ...userRight, ...data, updatedAt: new Date() };

                            //     // Update userName if userId changed
                            if (data.userId) {
                                const user = users.find(u => u.id.toString() === data.userId);
                                updatedData.userName = user ? `${user.firstName} ${user.lastName}` : userRight.userName;
                                updatedData.userId = parseInt(data.userId);
                            }

                            //     // Update access scope
                            if (data.districtName) {
                                updatedData.accessScope = data.districtName;
                            } else if (data.groupName) {
                                updatedData.accessScope = data.groupName;
                            } else if (data.regionName) {
                                updatedData.accessScope = data.regionName;
                            } else if (data.stateName) {
                                updatedData.accessScope = data.stateName;
                            } else {
                                updatedData.accessScope = 'All States';
                            }

                            return updatedData as UserRight;
                        }
                        return userRight;
                    }),
                }));
            },
            deleteUserRight: (id) => {
                set((state) => ({
                    userRights: state.userRights.filter((userRight) => userRight.id !== id),
                }));
            },
            setUserRights: (userRights) => {
                set({ userRights });
            },
        }),
        {
            name: 'user-rights-storage',
        }
    )
);