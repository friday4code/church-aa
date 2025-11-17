// stores/userRights.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    addUserRight: (data: UserRightFormData, options?: { userName?: string }) => void;
    updateUserRight: (id: number, data: Partial<UserRightFormData>, options?: { userName?: string }) => void;
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
            addUserRight: (data, options) => {
                const userName = options?.userName || 'Unknown User';

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

                const parsedUserId = parseInt(data.userId, 10);
                const safeUserId = Number.isNaN(parsedUserId) ? 0 : parsedUserId;

                const newUserRight: UserRight = {
                    id: Date.now(),
                    userId: safeUserId,
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
            updateUserRight: (id, data, options) => {
                set((state) => ({
                    userRights: state.userRights.map((userRight) => {
                        if (userRight.id === id) {
                            const updatedData = { ...userRight, ...data, updatedAt: new Date() };

                            // Update user reference if supplied
                            if (data.userId) {
                                const parsedUserId = parseInt(data.userId);
                                if (!Number.isNaN(parsedUserId)) {
                                    updatedData.userId = parsedUserId;
                                }
                            }

                            if (options?.userName) {
                                updatedData.userName = options.userName;
                            }

                            // Update access scope
                            let nextAccessScope = userRight.accessScope;
                            if (data.districtName) {
                                nextAccessScope = data.districtName;
                            } else if (data.groupName) {
                                nextAccessScope = data.groupName;
                            } else if (data.regionName) {
                                nextAccessScope = data.regionName;
                            } else if (data.stateName) {
                                nextAccessScope = data.stateName;
                            }

                            updatedData.accessScope = nextAccessScope;

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