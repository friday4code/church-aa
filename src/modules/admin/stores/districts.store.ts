// stores/districts.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DistrictFormData } from '../schemas/districts.schema';

export interface District {
    id: number;
    stateName: string;
    regionName: string;
    oldGroupName?: string;
    groupName: string;
    districtName: string;
    leader: string;
    createdAt: Date;
    updatedAt: Date;
}

interface DistrictsStore {
    districts: District[];
    addDistrict: (data: DistrictFormData) => void;
    updateDistrict: (id: number, data: Partial<DistrictFormData>) => void;
    deleteDistrict: (id: number) => void;
    setDistricts: (districts: District[]) => void;
}

export const useDistrictsStore = create<DistrictsStore>()(
    persist(
        (set) => ({
            districts: [],
            addDistrict: (data) => {
                const newDistrict: District = {
                    id: Date.now(),
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({ districts: [...state.districts, newDistrict] }));
            },
            updateDistrict: (id, data) => {
                set((state) => ({
                    districts: state.districts.map((district) =>
                        district.id === id
                            ? { ...district, ...data, updatedAt: new Date() }
                            : district
                    ),
                }));
            },
            deleteDistrict: (id) => {
                set((state) => ({
                    districts: state.districts.filter((district) => district.id !== id),
                }));
            },
            setDistricts: (districts) => {
                set({ districts });
            },
        }),
        {
            name: 'districts-storage',
        }
    )
);