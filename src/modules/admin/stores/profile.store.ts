// stores/admin-profile.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminProfileFormData, ChangePasswordFormData } from '../schemas/profile.schema';

export interface AdminProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    department?: string;
    bio?: string;
    avatar?: string;
    joinDate: Date;
    lastLogin: Date;
    isActive: boolean;
}

interface AdminProfileStore {
    profile: AdminProfile;
    updateProfile: (data: Partial<AdminProfileFormData>) => void;
    changePassword: (data: ChangePasswordFormData) => Promise<boolean>;
    uploadAvatar: (file: File) => Promise<string>;
}

// Mock initial admin data
const initialAdminProfile: AdminProfile = {
    id: 'admin-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@church.org',
    phone: '+1 (555) 123-4567',
    role: 'System Administrator',
    department: 'IT & Digital Ministry',
    bio: 'Passionate about leveraging technology to enhance church administration and member engagement. Dedicated to creating efficient systems for spiritual growth tracking.',
    avatar: '/api/placeholder/150/150',
    joinDate: new Date('2023-01-15'),
    lastLogin: new Date(),
    isActive: true,
};

export const useAdminProfileStore = create<AdminProfileStore>()(
    persist(
        (set) => ({
            profile: initialAdminProfile,

            updateProfile: (data) => {
                set((state) => ({
                    profile: {
                        ...state.profile,
                        ...data,
                    },
                }));
            },

            changePassword: async (data): Promise<boolean> => {
                // Simulate API call
                return new Promise((resolve) => {
                    setTimeout(() => {
                        console.log('Password changed successfully:', data);
                        resolve(true);
                    }, 1000);
                });
            },

            uploadAvatar: async (file): Promise<string> => {
                // Simulate file upload
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const newAvatarUrl = URL.createObjectURL(file);
                        set((state) => ({
                            profile: {
                                ...state.profile,
                                avatar: newAvatarUrl,
                            },
                        }));
                        resolve(newAvatarUrl);
                    }, 1500);
                });
            },
        }),
        {
            name: 'admin-profile-storage',
        }
    )
);