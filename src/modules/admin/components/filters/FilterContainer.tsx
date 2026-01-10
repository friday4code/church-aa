"use client"

import { VStack, Alert, Spinner, Text } from "@chakra-ui/react";
import { InfoCircle } from "iconsax-reactjs";
import { useFilters } from "./useFilters";
import { RegionPageFilter } from "./RegionPageFilter";
import { OldGroupPageFilter } from "./OldGroupPageFilter";
import { GroupsPageFilter } from "./GroupsPageFilter";

export type FilterPageType = "regions" | "oldgroups" | "groups";

interface FilterContainerProps {
    pageType: FilterPageType;
    persistState?: boolean;
    storageKey?: string;
}

export const FilterContainer = ({
    pageType,
    persistState = false,
    storageKey = "admin-filters"
}: FilterContainerProps) => {
    const { filterState, handlers, data, loadingStates, errors, isLoading, hasError } = useFilters({
        persistState,
        storageKey
    });

    if (isLoading) {
        return (
            <VStack align="center" p={4}>
                <Spinner size="lg" />
                <Text>Loading filter data...</Text>
            </VStack>
        );
    }

    if (hasError) {
        return (
            <VStack align="stretch" gap={2}>
                {errors.statesError && (
                    <Alert.Root status="error" variant="subtle">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>States Error</Alert.Title>
                            <Alert.Description>{errors.statesError}</Alert.Description>
                        </Alert.Content>
                    </Alert.Root>
                )}
                {errors.regionsError && (
                    <Alert.Root status="error" variant="subtle">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Regions Error</Alert.Title>
                            <Alert.Description>{errors.regionsError}</Alert.Description>
                        </Alert.Content>
                    </Alert.Root>
                )}
                {errors.oldGroupsError && (
                    <Alert.Root status="error" variant="subtle">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Old Groups Error</Alert.Title>
                            <Alert.Description>{errors.oldGroupsError}</Alert.Description>
                        </Alert.Content>
                    </Alert.Root>
                )}
                {errors.groupsError && (
                    <Alert.Root status="error" variant="subtle">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Groups Error</Alert.Title>
                            <Alert.Description>{errors.groupsError}</Alert.Description>
                        </Alert.Content>
                    </Alert.Root>
                )}
            </VStack>
        );
    }

    const commonProps = {
        states: data.states,
        regions: data.regions,
        oldGroups: data.oldGroups,
        groups: data.groups,
        selectedState: filterState.stateFilter,
        selectedRegion: filterState.regionFilter,
        selectedOldGroup: filterState.oldGroupFilter,
        selectedGroup: filterState.groupFilter,
        onStateChange: handlers.setStateFilter,
        onRegionChange: handlers.setRegionFilter,
        onOldGroupChange: handlers.setOldGroupFilter,
        onGroupChange: handlers.setGroupFilter
    };

    switch (pageType) {
        case "regions":
            return (
                <RegionPageFilter
                    states={data.states}
                    selectedState={filterState.stateFilter}
                    onStateChange={handlers.setStateFilter}
                />
            );
        case "oldgroups":
            return (
                <OldGroupPageFilter
                    states={data.states}
                    regions={data.regions}
                    selectedState={filterState.stateFilter}
                    selectedRegion={filterState.regionFilter}
                    onStateChange={handlers.setStateFilter}
                    onRegionChange={handlers.setRegionFilter}
                />
            );
        case "groups":
            return (
                <GroupsPageFilter
                    states={data.states}
                    regions={data.regions}
                    oldGroups={data.oldGroups}
                    selectedState={filterState.stateFilter}
                    selectedRegion={filterState.regionFilter}
                    selectedOldGroup={filterState.oldGroupFilter}
                    onStateChange={handlers.setStateFilter}
                    onRegionChange={handlers.setRegionFilter}
                    onOldGroupChange={handlers.setOldGroupFilter}
                />
            );
        default:
            return null;
    }
};