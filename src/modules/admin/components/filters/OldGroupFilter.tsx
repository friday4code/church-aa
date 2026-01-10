"use client"

import { useMemo, useEffect } from "react";
import { BaseSelectFilter, createFilterCollection, createFilterOption } from "./BaseSelectFilter";
import type { OldGroupFilterProps } from "./types";

export const OldGroupFilter = ({
    oldGroups,
    selectedOldGroup,
    onOldGroupChange,
    stateFilter,
    placeholder = "All Old Groups",
    width = "200px",
    size = "md"
}: OldGroupFilterProps) => {
    const filteredOldGroups = useMemo(() => {
        if (!stateFilter) return oldGroups;
        return oldGroups.filter(oldGroup => 
            oldGroup.state_id?.toString() === stateFilter || 
            oldGroup.state === oldGroups.find(og => og.state_id?.toString() === stateFilter)?.state
        );
    }, [oldGroups, stateFilter]);

    const oldGroupCollection = useMemo(() => {
        const items = [
            createFilterOption("All Old Groups", ""),
            ...filteredOldGroups.map(oldGroup => createFilterOption(oldGroup.name, oldGroup.id))
        ];
        return createFilterCollection(items);
    }, [filteredOldGroups]);

    // Reset old group filter if the selected old group is not in the filtered list
    useEffect(() => {
        if (selectedOldGroup && !filteredOldGroups.some(og => og.id.toString() === selectedOldGroup)) {
            onOldGroupChange("");
        }
    }, [selectedOldGroup, filteredOldGroups, onOldGroupChange]);

    return (
        <BaseSelectFilter
            collection={oldGroupCollection}
            selectedValue={selectedOldGroup}
            onValueChange={onOldGroupChange}
            placeholder={placeholder}
            width={width}
            size={size}
        />
    );
};