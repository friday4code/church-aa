// stores/admin-profile.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminProfileFormData, ChangePasswordFormData } from '../schemas/profile.schema';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types/auth.type';

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
    syncWithAuthStore: () => void;
}

// Helper function to extract first and last name from full name
const extractNames = (fullName: string): { firstName: string; lastName: string } => {
    const names = fullName.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';
    return { firstName, lastName };
};

// Create initial profile from auth store data
const createInitialProfile = (): AdminProfile => {
    const authStore = useAuthStore.getState();
    const user = authStore.user;

    const { firstName, lastName } = extractNames(user?.name || '');

    return {
        id: user?.id?.toString() || '1',
        firstName,
        lastName,
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.access_level || 'user',
        department: getDepartmentFromRole(user),
        bio: getBioFromRole(user),
        avatar: '/api/placeholder/150/150',
        joinDate: new Date('2023-01-15'),
        lastLogin: new Date(),
        isActive: user?.is_active || false
    };
};

// Helper function to determine department based on role/access level
const getDepartmentFromRole = (user: User | null): string => {
    if (!user) return 'Administration';

    switch (user.access_level) {
        case 'admin':
            return 'System Administration';
        case 'regional_admin':
            return 'Regional Administration';
        case 'state_admin':
            return 'State Administration';
        case 'district_admin':
            return 'District Administration';
        default:
            return 'General Administration';
    }
};

// Helper function to generate bio based on role
const getBioFromRole = (user: User | null): string => {
    if (!user) return 'System administrator with full access to all features and settings.';

    switch (user.access_level) {
        case 'admin':
            return 'System administrator with full access to all features and settings across all regions.';
        case 'regional_admin':
            return `Regional administrator managing church operations in region ${user.region_id}.`;
        case 'state_admin':
            return `State administrator overseeing church activities in state ${user.state_id}.`;
        case 'district_admin':
            return `District administrator coordinating church programs in district ${user.district_id}.`;
        default:
            return 'Church administration team member dedicated to supporting ministry operations.';
    }
};

export const useAdminProfileStore = create<AdminProfileStore>()(
    persist(
        (set) => ({
            profile: createInitialProfile(),

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

            syncWithAuthStore: () => {
                const newProfile = createInitialProfile();
                set({ profile: newProfile });
            },
        }),
        {
            name: 'admin-profile-storage',
        }
    )
);