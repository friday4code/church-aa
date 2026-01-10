import type { State } from "@/types/states.type";
import type { Region } from "@/types/regions.type";
import type { OldGroup } from "@/types/oldGroups.type";
import type { Group } from "@/types/groups.type";

export interface FilterOption {
    label: string;
    value: string | number;
}

export interface BaseFilterProps {
    className?: string;
    width?: string;
    size?: "sm" | "md" | "lg";
}

export interface StateFilterProps extends BaseFilterProps {
    states: State[];
    selectedState: string;
    onStateChange: (stateId: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    error?: string | null;
}

export interface RegionFilterProps extends BaseFilterProps {
    regions: Region[];
    selectedRegion: string;
    onRegionChange: (regionId: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    error?: string | null;
    stateFilter?: string;
}

export interface OldGroupFilterProps extends BaseFilterProps {
    oldGroups: OldGroup[];
    selectedOldGroup: string;
    onOldGroupChange: (oldGroupId: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    error?: string | null;
    stateFilter?: string;
}

export interface GroupFilterProps extends BaseFilterProps {
    groups: Group[];
    selectedGroup: string;
    onGroupChange: (groupId: string) => void;
    placeholder?: string;
    isLoading?: boolean;
    error?: string | null;
    oldGroupFilter?: string;
}

export interface FilterState {
    stateFilter: string;
    regionFilter: string;
    oldGroupFilter: string;
    groupFilter: string;
}

export interface FilterHandlers {
    setStateFilter: (value: string) => void;
    setRegionFilter: (value: string) => void;
    setOldGroupFilter: (value: string) => void;
    setGroupFilter: (value: string) => void;
    resetFilters: () => void;
}

export interface FilterData {
    states: State[];
    regions: Region[];
    oldGroups: OldGroup[];
    groups: Group[];
}

export interface FilterLoadingStates {
    statesLoading: boolean;
    regionsLoading: boolean;
    oldGroupsLoading: boolean;
    groupsLoading: boolean;
}

export interface FilterErrors {
    statesError: string | null;
    regionsError: string | null;
    oldGroupsError: string | null;
    groupsError: string | null;
}