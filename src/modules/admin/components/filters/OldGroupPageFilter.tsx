"use client"

import { useEffect } from "react";
import { SimpleGrid, Button } from "@chakra-ui/react";
import { CloseCircle } from "iconsax-reactjs";
import { StateFilter } from "./StateFilter";
import { RegionFilter } from "./RegionFilter";
import type { State } from "@/types/states.type";
import type { Region } from "@/types/regions.type";

interface OldGroupPageFilterProps {
    states: State[];
    regions: Region[];
    selectedState: string;
    selectedRegion: string;
    onStateChange: (stateId: string) => void;
    onRegionChange: (regionId: string) => void;
    size?: "sm" | "md" | "lg";
    width?: string;
}

export const OldGroupPageFilter = ({
    states,
    regions,
    selectedState,
    selectedRegion,
    onStateChange,
    onRegionChange,
    size = "md",
    width = "200px"
}: OldGroupPageFilterProps) => {
    const handleReset = () => {
        onStateChange("");
        onRegionChange("");
    };

    return (
        <SimpleGrid gap={8} overflowX="auto" pb={{ base: 2, md: 0 }} columns={{ base: 2, md: 3 }}>
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
            <Button 
                variant="surface" 
                colorPalette="red" 
                onClick={handleReset}
                disabled={!selectedState && !selectedRegion}
            >
                <CloseCircle /> Reset Filters
            </Button>
        </SimpleGrid>
    );
};