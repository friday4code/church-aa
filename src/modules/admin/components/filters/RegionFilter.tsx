"use client"

import { useMemo, useEffect } from "react";
import { BaseSelectFilter, createFilterCollection, createFilterOption } from "./BaseSelectFilter";
import type { RegionFilterProps } from "./types";

export const RegionFilter = ({
    regions,
    selectedRegion,
    onRegionChange,
    stateFilter,
    placeholder = "All Regions",
    width = "200px",
    size = "md"
}: RegionFilterProps) => {
    const filteredRegions = useMemo(() => {
        if (!stateFilter) return regions;
        return regions.filter(region => 
            region.state_id?.toString() === stateFilter || 
            region.state === regions.find(r => r.state_id?.toString() === stateFilter)?.state
        );
    }, [regions, stateFilter]);

    const regionCollection = useMemo(() => {
        const items = [
            createFilterOption("All Regions", ""),
            ...filteredRegions.map(region => createFilterOption(region.name, region.id))
        ];
        return createFilterCollection(items);
    }, [filteredRegions]);

    // Reset region filter if the selected region is not in the filtered list
    useEffect(() => {
        if (selectedRegion && !filteredRegions.some(r => r.id.toString() === selectedRegion)) {
            onRegionChange("");
        }
    }, [selectedRegion, filteredRegions, onRegionChange]);

    return (
        <BaseSelectFilter
            collection={regionCollection}
            selectedValue={selectedRegion}
            onValueChange={onRegionChange}
            placeholder={placeholder}
            width={width}
            size={size}
        />
    );
};