import { useState, useCallback, useMemo } from "react";
import { useStates } from "@/modules/admin/hooks/useState";
import { useRegions } from "@/modules/admin/hooks/useRegion";
import { useOldGroups } from "@/modules/admin/hooks/useOldGroup";
import { useGroups } from "@/modules/admin/hooks/useGroup";
import type { FilterState, FilterHandlers, FilterData, FilterLoadingStates, FilterErrors } from "./types";

interface UseFiltersProps {
    persistState?: boolean;
    storageKey?: string;
}

export const useFilters = ({
    persistState = false,
    storageKey = "admin-filters"
}: UseFiltersProps = {}) => {
    // Load persisted state if enabled
    const getInitialState = (): FilterState => {
        if (!persistState) {
            return {
                stateFilter: "",
                regionFilter: "",
                oldGroupFilter: "",
                groupFilter: ""
            };
        }

        try {
            const persisted = localStorage.getItem(storageKey);
            if (persisted) {
                return JSON.parse(persisted);
            }
        } catch (error) {
            console.warn("Failed to load persisted filter state:", error);
        }

        return {
            stateFilter: "",
            regionFilter: "",
            oldGroupFilter: "",
            groupFilter: ""
        };
    };

    const [filterState, setFilterState] = useState<FilterState>(getInitialState);

    // Persist state changes if enabled
    const persistFilterState = useCallback((newState: FilterState) => {
        if (persistState) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(newState));
            } catch (error) {
                console.warn("Failed to persist filter state:", error);
            }
        }
    }, [persistState, storageKey]);

    // Filter handlers
    const setStateFilter = useCallback((value: string) => {
        setFilterState(prev => {
            const newState = {
                ...prev,
                stateFilter: value,
                // Reset dependent filters when state changes
                regionFilter: "",
                oldGroupFilter: "",
                groupFilter: ""
            };
            persistFilterState(newState);
            return newState;
        });
    }, [persistFilterState]);

    const setRegionFilter = useCallback((value: string) => {
        setFilterState(prev => {
            const newState = {
                ...prev,
                regionFilter: value,
                // Reset dependent filters when region changes
                oldGroupFilter: "",
                groupFilter: ""
            };
            persistFilterState(newState);
            return newState;
        });
    }, [persistFilterState]);

    const setOldGroupFilter = useCallback((value: string) => {
        setFilterState(prev => {
            const newState = {
                ...prev,
                oldGroupFilter: value,
                // Reset dependent filters when old group changes
                groupFilter: ""
            };
            persistFilterState(newState);
            return newState;
        });
    }, [persistFilterState]);

    const setGroupFilter = useCallback((value: string) => {
        setFilterState(prev => {
            const newState = {
                ...prev,
                groupFilter: value
            };
            persistFilterState(newState);
            return newState;
        });
    }, [persistFilterState]);

    const resetFilters = useCallback(() => {
        const newState = {
            stateFilter: "",
            regionFilter: "",
            oldGroupFilter: "",
            groupFilter: ""
        };
        setFilterState(newState);
        persistFilterState(newState);
    }, [persistFilterState]);

    // Fetch data using existing hooks
    const { states = [], isLoading: statesLoading, error: statesError } = useStates();
    const { regions = [], isLoading: regionsLoading, error: regionsError } = useRegions();
    const { oldGroups = [], isLoading: oldGroupsLoading, error: oldGroupsError } = useOldGroups();
    const { groups = [], isLoading: groupsLoading, error: groupsError } = useGroups();

    // Filter data based on current filter state
    const filteredData = useMemo(() => {
        let filteredRegions = regions;
        let filteredOldGroups = oldGroups;
        let filteredGroups = groups;

        // Filter regions by selected state
        if (filterState.stateFilter) {
            filteredRegions = regions.filter(region => 
                region.state_id?.toString() === filterState.stateFilter ||
                region.state === states.find(s => s.id.toString() === filterState.stateFilter)?.name
            );
        }

        // Filter old groups by selected state
        if (filterState.stateFilter) {
            filteredOldGroups = oldGroups.filter(oldGroup =>
                oldGroup.state_id?.toString() === filterState.stateFilter ||
                oldGroup.state === states.find(s => s.id.toString() === filterState.stateFilter)?.name
            );
        }

        // Filter old groups by selected region
        if (filterState.regionFilter) {
            filteredOldGroups = filteredOldGroups.filter(oldGroup =>
                oldGroup.region_id?.toString() === filterState.regionFilter ||
                oldGroup.region === regions.find(r => r.id.toString() === filterState.regionFilter)?.name
            );
        }

        // Filter groups by selected old group
        if (filterState.oldGroupFilter) {
            filteredGroups = groups.filter(group =>
                group.old_group_id?.toString() === filterState.oldGroupFilter ||
                group.old_group === oldGroups.find(og => og.id.toString() === filterState.oldGroupFilter)?.name
            );
        }

        return {
            states,
            regions: filteredRegions,
            oldGroups: filteredOldGroups,
            groups: filteredGroups
        };
    }, [states, regions, oldGroups, groups, filterState]);

    const loadingStates: FilterLoadingStates = {
        statesLoading,
        regionsLoading,
        oldGroupsLoading,
        groupsLoading
    };

    const errors: FilterErrors = {
        statesError: statesError?.message || null,
        regionsError: regionsError?.message || null,
        oldGroupsError: oldGroupsError?.message || null,
        groupsError: groupsError?.message || null
    };

    const handlers: FilterHandlers = {
        setStateFilter,
        setRegionFilter,
        setOldGroupFilter,
        setGroupFilter,
        resetFilters
    };

    return {
        filterState,
        handlers,
        data: filteredData,
        loadingStates,
        errors,
        isLoading: statesLoading || regionsLoading || oldGroupsLoading || groupsLoading,
        hasError: !!(statesError || regionsError || oldGroupsError || groupsError)
    };
};