// stores/regions.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RegionFormData } from '../schemas/region.schema';

export interface Region {
    id: number;
    regionName: string;
    stateName: string;
    leader: string;
}

interface RegionsStore {
    regions: Region[];
    addRegion: (region: RegionFormData) => void;
    updateRegion: (id: number, region: Partial<RegionFormData>) => void;
    deleteRegion: (id: number) => void;
    setRegions: (regions: Region[]) => void;
}

export const useRegionsStore = create<RegionsStore>()(
    persist(
        (set) => ({
            regions: [],

            addRegion: (regionData) => {
                const newRegion: Region = {
                    id: Date.now(),
                    ...regionData,
                };
                set((state) => ({
                    regions: [...state.regions, newRegion],
                }));
            },

            updateRegion: (id, regionData) => {
                set((state) => ({
                    regions: state.regions.map((region) =>
                        region.id === id ? { ...region, ...regionData } : region
                    ),
                }));
            },

            deleteRegion: (id) => {
                set((state) => ({
                    regions: state.regions.filter((region) => region.id !== id),
                }));
            },

            setRegions: (regions) => {
                set({ regions });
            },
        }),
        {
            name: 'regions-storage',
        }
    )
);