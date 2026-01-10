"use client"

import { useMemo, useEffect } from "react";
import { BaseSelectFilter, createFilterCollection, createFilterOption } from "./BaseSelectFilter";
import type { GroupFilterProps } from "./types";

export const GroupFilter = ({
    groups,
    selectedGroup,
    onGroupChange,
    oldGroupFilter,
    placeholder = "All Groups",
    width = "200px",
    size = "md"
}: GroupFilterProps) => {
    const filteredGroups = useMemo(() => {
        if (!oldGroupFilter) return groups;
        return groups.filter(group => 
            group.old_group_id?.toString() === oldGroupFilter || 
            group.old_group === groups.find(g => g.old_group_id?.toString() === oldGroupFilter)?.old_group
        );
    }, [groups, oldGroupFilter]);

    const groupCollection = useMemo(() => {
        const items = [
            createFilterOption("All Groups", ""),
            ...filteredGroups.map(group => createFilterOption(group.name, group.id))
        ];
        return createFilterCollection(items);
    }, [filteredGroups]);

    // Reset group filter if the selected group is not in the filtered list
    useEffect(() => {
        if (selectedGroup && !filteredGroups.some(g => g.id.toString() === selectedGroup)) {
            onGroupChange("");
        }
    }, [selectedGroup, filteredGroups, onGroupChange]);

    return (
        <BaseSelectFilter
            collection={groupCollection}
            selectedValue={selectedGroup}
            onValueChange={onGroupChange}
            placeholder={placeholder}
            width={width}
            size={size}
        />
    );
};