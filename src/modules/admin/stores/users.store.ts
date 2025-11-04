// stores/users.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserFormData } from '../schemas/users.schema';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string; // In real app, this should be hashed
    createdAt: Date;
    updatedAt: Date;
}

interface UsersStore {
    users: User[];
    addUser: (data: UserFormData) => void;
    updateUser: (id: number, data: Partial<UserFormData>) => void;
    deleteUser: (id: number) => void;
    setUsers: (users: User[]) => void;
}

export const useUsersStore = create<UsersStore>()(
    persist(
        (set) => ({
            users: [
                {
                    id: 1,
                    firstName: 'Samuel',
                    lastName: 'Adiela',
                    email: 'samueladiela3@gmail.com',
                    phone: '+23470871467941',
                    password: 'hashed_password',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 2,
                    firstName: 'Daniel',
                    lastName: 'Okon',
                    email: 'danieluokon@gmail.com',
                    phone: '+2347087281841',
                    password: 'hashed_password',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                // Add more sample users as needed
            ],
            addUser: (data) => {
                const newUser: User = {
                    id: Date.now(),
                    ...data,
                    password: data.password || 'default_password', // In real app, hash this
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ users: [...state.users, newUser] }));
            },
            updateUser: (id, data) => {
                set((state) => ({
                    users: state.users.map((user) =>
                        user.id === id
                            ? {
                                ...user,
                                ...data,
                                password: data.password ? data.password : user.password, // Only update password if provided
                                updatedAt: new Date()
                            }
                            : user
                    ),
                }));
            },
            deleteUser: (id) => {
                set((state) => ({
                    users: state.users.filter((user) => user.id !== id),
                }));
            },
            setUsers: (users) => {
                set({ users });
            },
        }),
        {
            name: 'users-storage',
        }
    )
);