"use client"

import { SimpleGrid, Button } from "@chakra-ui/react";
import { CloseCircle } from "iconsax-reactjs";
import { StateFilter } from "./StateFilter";
import { RegionFilter } from "./RegionFilter";
import { OldGroupFilter } from "./OldGroupFilter";
import type { State } from "@/types/states.type";
import type { Region } from "@/types/regions.type";
import type { OldGroup } from "@/types/oldGroups.type";

interface GroupsPageFilterProps {
    states: State[];
    regions: Region[];
    oldGroups: OldGroup[];
    selectedState: string;
    selectedRegion: string;
    selectedOldGroup: string;
    onStateChange: (stateId: string) => void;
    onRegionChange: (regionId: string) => void;
    onOldGroupChange: (oldGroupId: string) => void;
    size?: "sm" | "md" | "lg";
    width?: string;
}

export const GroupsPageFilter = ({
    states,
    regions,
    oldGroups,
    selectedState,
    selectedRegion,
    selectedOldGroup,
    onStateChange,
    onRegionChange,
    onOldGroupChange,
    size = "md",
    width = "200px"
}: GroupsPageFilterProps) => {
    const handleReset = () => {
        onStateChange("");
        onRegionChange("");
        onOldGroupChange("");
    };

    return (
        <SimpleGrid gap={8} overflowX="auto" pb={{ base: 2, md: 0 }} columns={{ base: 2, md: 4 }}>
            <StateFilter
                states={states}
                selectedState={selectedState}
                onStateChange={onStateChange}
                size={size}
                width={width}
            />
            <RegionFilter
                regions={regions}
                selectedRegion={selectedRegion}
                onRegionChange={onRegionChange}
                stateFilter={selectedState}
                size={size}
                width={width}
            />
            <OldGroupFilter
                oldGroups={oldGroups}
                selectedOldGroup={selectedOldGroup}
                onOldGroupChange={onOldGroupChange}
                stateFilter={selectedState}
                size={size}
                width={width}
            />
            <Button 
                variant="surface" 
                colorPalette="red" 
                onClick={handleReset}
                disabled={!selectedState && !selectedRegion && !selectedOldGroup}
            >
                <CloseCircle /> Reset Filters
            </Button>
        </SimpleGrid>
    );
};